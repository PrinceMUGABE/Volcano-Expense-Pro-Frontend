/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faSearch,
  faCalendar,
  faMoneyBill,
  faUser,
  faFileInvoice,
} from "@fortawesome/free-solid-svg-icons";

function Driver_Reimbursement() {
  const [reimbursementData, setReimbursementData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDownloading, setIsDownloading] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const navigate = useNavigate();

  const itemsPerPageOptions = [6, 10, 30, 50, 100];

  const storedUserData = localStorage.getItem("userData");
  const accessToken = storedUserData ? JSON.parse(storedUserData).access_token : null;

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
      return;
    }
    handleFetch();
  }, [accessToken, navigate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const handleFetch = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/reimbursement/user/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (Array.isArray(res.data) && res.data.length > 0) {
        setReimbursementData(res.data);
        setMessage(`${res.data.length} reimbursements retrieved`);
        setMessageType("success");
      } else {
        setReimbursementData([]);
        setMessage("No reimbursements found");
        setMessageType("warning");
      }
    } catch (err) {
      console.error("Error fetching reimbursements:", err);
      setMessage("Error fetching reimbursements");
      setMessageType("error");
    }
  };

  const filterData = () => {
    return reimbursementData.filter((item) => {
      const matchesSearch =
        item.expense?.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.expense?.user?.phone_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.expense?.amount?.toString().includes(searchQuery);

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "paid" && item.is_paid) ||
        (filterStatus === "unpaid" && !item.is_paid);

      return matchesSearch && matchesStatus;
    });
  };

  const formatDataForExport = (data) => {
    return data.map((item) => ({
      "Expense Category": item.expense?.category,
      Driver: item.expense?.user?.phone_number,
      "Amount (FRW)": item.expense?.amount,
      Status: item.is_paid ? "Paid" : "Unpaid",
      Date: item.expense?.date,
      "Created Date": new Date(item.created_at).toLocaleDateString(),
    }));
  };

  const downloadPDF = async () => {
    setIsDownloading(true);
    try {
      const doc = new jsPDF();
      const formattedData = formatDataForExport(filterData());

      doc.setFontSize(16);
      doc.text("Reimbursement Report", 14, 15);

      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);

      const headers = Object.keys(formattedData[0]);
      const data = formattedData.map((row) => Object.values(row));

      doc.autoTable({
        head: [headers],
        body: data,
        startY: 35,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      doc.save("reimbursements.pdf");
      setMessage("PDF downloaded successfully");
      setMessageType("success");
    } catch (error) {
      setMessage("Error generating PDF");
      setMessageType("error");
    } finally {
      setIsDownloading(false);
      setDownloadMenuVisible(false);
    }
  };

  const downloadExcel = async () => {
    setIsDownloading(true);
    try {
      const formattedData = formatDataForExport(filterData());
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reimbursements");
      XLSX.writeFile(workbook, "reimbursements.xlsx");
      setMessage("Excel file downloaded successfully");
      setMessageType("success");
    } catch (error) {
      setMessage("Error generating Excel file");
      setMessageType("error");
    } finally {
      setIsDownloading(false);
      setDownloadMenuVisible(false);
    }
  };

  const downloadCSV = async () => {
    setIsDownloading(true);
    try {
      const formattedData = formatDataForExport(filterData());
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const csvContent = XLSX.utils.sheet_to_csv(worksheet);

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "reimbursements.csv";
      link.click();

      setMessage("CSV file downloaded successfully");
      setMessageType("success");
    } catch (error) {
      setMessage("Error generating CSV file");
      setMessageType("error");
    } finally {
      setIsDownloading(false);
      setDownloadMenuVisible(false);
    }
  };

  const filteredData = filterData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const countByStatus = {
    all: reimbursementData.length,
    paid: reimbursementData.filter((item) => item.is_paid).length,
    unpaid: reimbursementData.filter((item) => !item.is_paid).length,
  };

  return (
    <div className="p-4">
      <h1 className="text-center text-black font-bold text-xl mb-6">
        Reimbursement Management
      </h1>

      {message && (
        <div
          className={`text-center py-2 px-4 mb-4 rounded ${
            messageType === "success" ? "text-green-500" : "text-red-500"
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            All ({countByStatus.all})
          </button>
          <button
            onClick={() => setFilterStatus("paid")}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === "paid"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Paid ({countByStatus.paid})
          </button>
          <button
            onClick={() => setFilterStatus("unpaid")}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === "unpaid"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Unpaid ({countByStatus.unpaid})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-gray-700">Items per page:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="border rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Search reimbursements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-gray-700 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>

          <div className="relative w-full md:w-auto">
            <button
              onClick={() => setDownloadMenuVisible(!downloadMenuVisible)}
              disabled={isDownloading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faDownload} />
              {isDownloading ? "Downloading..." : "Download"}
            </button>
            {downloadMenuVisible && (
              <div className="absolute right-0 mt-2 py-2 w-48 text-gray-700 bg-white rounded-lg shadow-xl z-10">
                <button
                  onClick={downloadPDF}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Download as PDF
                </button>
                <button
                  onClick={downloadExcel}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Download as Excel
                </button>
                <button
                  onClick={downloadCSV}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Download as CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentData.map((item, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
          >
            <div className="text-gray-700 mb-2">
              <span className="font-bold">Expense Category:</span> {" "}
              {item.expense?.category || "N/A"}
            </div>
            <div className="text-gray-700 mb-2">
              <span className="font-bold">Driver:</span> {" "}
              {item.expense?.user?.phone_number || "N/A"}
            </div>
            <div className="text-gray-700 mb-2">
              <span className="font-bold">Amount:</span> {" "}
              {item.expense?.amount || "0.00"} FRW
            </div>
            <div className="text-gray-700 mb-2">
              <span className="font-bold">Status:</span> {" "}
              <span
                className={
                  item.is_paid ? "text-green-600" : "text-green-600"
                }
              >
                {item.is_paid ? "Paid" : "Unpaid"}
              </span>
            </div>
            <div className="text-gray-700 mb-2">
              <span className="font-bold">Date:</span> {" "}
              {item.expense?.date || "N/A"}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Driver_Reimbursement;
