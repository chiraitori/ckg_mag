"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, Download } from 'lucide-react';
import ExcelJS from 'exceljs';
import { useSession } from "next-auth/react";
import { format, toZonedTime } from 'date-fns-tz';
import Select from 'react-select';

interface Row {
  id: number;
  text: string;
  number: string;
  note: string;
}

interface InventoryItem {
  value: string;
  label: string;
}

const DynamicTable: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [currentInput, setCurrentInput] = useState<Omit<Row, 'id'>>({ text: '', number: '', note: '' });
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch('/api/inventory');
      if (response.ok) {
        const data: string[] = await response.json();
        setInventoryItems(data.map(item => ({ value: item, label: item })));
      } else {
        console.error('Failed to fetch inventory items');
      }
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    }
  };

  const handleInputChange = (field: 'text' | 'number' | 'note', value: string) => {
    setCurrentInput(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (selectedOption: InventoryItem | null) => {
    if (selectedOption) {
      setCurrentInput(prev => ({ ...prev, text: selectedOption.value }));
    } else {
      setCurrentInput(prev => ({ ...prev, text: '' }));
    }
  };

  const addRow = () => {
    if (currentInput.text || currentInput.number || currentInput.note) {
      const newRow: Row = {
        id: Date.now(),
        ...currentInput
      };
      setRows([...rows, newRow]);
      setCurrentInput({ text: '', number: '', note: '' });
    }
  };

  const deleteRow = (id: number) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Add headers
    worksheet.addRow(['Tên đồ', 'Số Lượng', 'Ghi Chú']);

    // Add data
    rows.forEach(row => {
      worksheet.addRow([row.text, row.number, row.note]);
    });

    // Generate file name with date, time, and user name
    const now = new Date();
    const timeZone = 'Asia/Ho_Chi_Minh';
    const zonedDate = toZonedTime(now, timeZone);
    const dateTime = format(zonedDate, "yyyy-MM-dd'-T-'HH-mm", { timeZone });
    const userName = session?.user?.name || 'Unknown';
    const fileName = `${userName}_${dateTime}.xlsx`;

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 flex flex-col md:flex-row">
      {/* Input form on the left */}
      <div className="w-full md:w-1/3 pr-4 mb-4 md:mb-0">
        <h2 className="text-xl font-bold mb-4">Thêm hàng mới</h2>
        <div className="mb-4">
          <label htmlFor="textInput" className="block mb-2">Tên đồ</label>
          <Select
            id="textInput"
            options={inventoryItems}
            value={inventoryItems.find(item => item.value === currentInput.text)}
            onChange={handleSelectChange}
            onInputChange={(inputValue) => handleInputChange('text', inputValue)}
            isClearable
            isSearchable
            placeholder="Select or type an item"
            className="react-select-container"
            classNamePrefix="react-select"
          />
          <label htmlFor="textInput" className="block mb-2">Tên đồ khác</label>
          <input
            id="textInput"
            type="text"
            value={currentInput.text}
            onChange={(e) => handleInputChange('text', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="numberInput" className="block mb-2">Số lượng:</label>
          <input
            id="numberInput"
            type="number"
            value={currentInput.number}
            onChange={(e) => handleInputChange('number', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="noteInput" className="block mb-2">Ghi Chú</label>
          <input
            id="noteInput"
            type="text"
            value={currentInput.note}
            onChange={(e) => handleInputChange('note', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          onClick={addRow}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Thêm
        </button>
      </div>

      {/* Table on the right */}
      <div className="w-full md:w-2/3">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Bảng thống kê</h2>
          <button onClick={exportToExcel} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center">
            <Download size={20} className="mr-2" />
            Xuất Excel
          </button>
        </div>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Tên đồ</th>
              <th className="border border-gray-300 p-2">Số Lượng</th>
              <th className="border border-gray-300 p-2">Ghi Chú</th>
              <th className="border border-gray-300 p-2">Xóa</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="border border-gray-300 p-2">{row.text}</td>
                <td className="border border-gray-300 p-2">{row.number}</td>
                <td className="border border-gray-300 p-2">{row.note}</td>
                <td className="border border-gray-300 p-2">
                  <button
                    onClick={() => deleteRow(row.id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Delete row"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DynamicTable;