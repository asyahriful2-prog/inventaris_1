import React, { useState, useEffect } from "react";
import axios from 'axios';
import "./style.css";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import * as XLSX from "xlsx";

// Fungsi pembantu untuk memformat tanggal
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("id-ID", options);
};

// Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Ubah inisialisasi state menjadi array kosong
  const [alat, setAlat] = useState([]);
  const [bahan, setBahan] = useState([]);
  const [peminjaman, setPeminjaman] = useState([]);

  // Ambil data dari file JSON saat komponen dimuat
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [alatRes, bahanRes, peminjamanRes] = await Promise.all([
          fetch("/data/alat.json"),
          fetch("/data/bahan.json"),
          fetch("/data/peminjaman.json"),
        ]);

        const alatData = await alatRes.json();
        const bahanData = await bahanRes.json();
        const peminjamanData = await peminjamanRes.json();

        setAlat(alatData);
        setBahan(bahanData);
        setPeminjaman(peminjamanData);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      }
    };

    fetchAllData();
  }, []); // [] memastikan useEffect hanya berjalan sekali saat mount

  // Form input dengan tambahan lokasi
  const [formAlat, setFormAlat] = useState({
    nama: "",
    baik: "",
    rusak: "",
    tanggal: getTodayDate(),
    lab: "",
    lokasi: "",
  });
  const [formBahan, setFormBahan] = useState({
    nama: "",
    simbol: "",
    jumlah: "",
    is_expired: "false",
    satuan: "",
    tanggal: getTodayDate(),
    lab: "",
    lokasi: "",
  });
  const [formPinjam, setFormPinjam] = useState({
    peminjam: "",
    jenis: "Alat",
    namaItem: "",
    jumlah: "",
    tanggalPinjam: getTodayDate(),
  });

  // State untuk search dan filter
  const [searchAlat, setSearchAlat] = useState("");
  const [filterAlatLab, setFilterAlatLab] = useState("Semua");
  const [searchBahan, setSearchBahan] = useState("");
  const [filterBahanLab, setFilterBahanLab] = useState("Semua");
  const [searchPeminjaman, setSearchPeminjaman] = useState("");
  const [filterPeminjamanJenis, setFilterPeminjamanJenis] = useState("Semua");
  const [filterPeminjamanStatus, setFilterPeminjamanStatus] = useState("Semua");

  // Edit state
  const [editAlatId, setEditAlatId] = useState(null);
  const [editBahanId, setEditBahanId] = useState(null);

  // state untuk pengembalian
  const [returnDate, setReturnDate] = useState("");
  const [returnId, setReturnId] = useState(null);

  // --- CRUD Alat ---
  const handleTambahAlat = () => {
    if (
      !formAlat.nama ||
      formAlat.baik === "" ||
      formAlat.rusak === "" ||
      !formAlat.tanggal ||
      !formAlat.lab ||
      !formAlat.lokasi
    )
      return;
    const baikNum = parseInt(formAlat.baik) || 0;
    const rusakNum = parseInt(formAlat.rusak) || 0;

    if (editAlatId) {
      setAlat(
        alat.map((a) =>
          a.id === editAlatId
            ? {
                ...a,
                nama: formAlat.nama,
                baik: baikNum,
                rusak: rusakNum,
                tanggal: formAlat.tanggal,
                lab: formAlat.lab,
                lokasi: formAlat.lokasi,
              }
            : a
        )
      );
      setEditAlatId(null);
    } else {
      const newAlat = {
        ...formAlat,
        id: Date.now(),
        baik: baikNum,
        rusak: rusakNum,
      };
      setAlat([...alat, newAlat]);
    }
    setFormAlat({
      nama: "",
      baik: "",
      rusak: "",
      tanggal: getTodayDate(),
      lab: "",
      lokasi: "",
    });
  };
  const handleEditAlat = (a) => {
    setFormAlat({
      nama: a.nama,
      baik: String(a.baik),
      rusak: String(a.rusak),
      tanggal: a.tanggal || "",
      lab: a.lab || "",
      lokasi: a.lokasi || "",
    });
    setEditAlatId(a.id);
  };
  const handleHapusAlat = (id) => setAlat(alat.filter((a) => a.id !== id));

  // --- CRUD Bahan ---
  const handleTambahBahan = () => {
    if (
      !formBahan.nama ||
      formBahan.jumlah === "" ||
      !formBahan.satuan ||
      !formBahan.tanggal ||
      !formBahan.lab ||
      !formBahan.lokasi
    )
      return;
    const jumlahNum = parseInt(formBahan.jumlah) || 0;

    const isExpired = formBahan.is_expired === "true"; // Konversi string ke boolean

    if (editBahanId) {
      setBahan(
        bahan.map((b) =>
          b.id === editBahanId
            ? {
                ...b,
                nama: formBahan.nama,
                simbol: formBahan.simbol,
                jumlah: jumlahNum,
                is_expired: isExpired,
                satuan: formBahan.satuan,
                tanggal: formBahan.tanggal,
                lab: formBahan.lab,
                lokasi: formBahan.lokasi,
              }
            : b
        )
      );
      setEditBahanId(null);
    } else {
      const newBahan = {
        ...formBahan,
        id: Date.now(),
        jumlah: jumlahNum,
        is_expired: isExpired,
      };
      setBahan([...bahan, newBahan]);
    }
    setFormBahan({
      nama: "",
      simbol: "",
      jumlah: "",
      is_expired: "false",
      satuan: "",
      tanggal: getTodayDate(),
      lab: "",
      lokasi: "",
    });
  };
  const handleEditBahan = (b) => {
    setFormBahan({
      nama: b.nama,
      simbol: b.simbol || "",
      jumlah: String(b.jumlah),
      is_expired: String(b.is_expired),
      satuan: b.satuan || "",
      tanggal: b.tanggal || "",
      lab: b.lab || "",
      lokasi: b.lokasi || "",
    });
    setEditBahanId(b.id);
  };
  const handleHapusBahan = (id) => setBahan(bahan.filter((b) => b.id !== id));

  // --- Peminjaman ---
  const handlePinjam = () => {
    if (
      !formPinjam.peminjam ||
      !formPinjam.namaItem ||
      !formPinjam.jumlah ||
      !formPinjam.tanggalPinjam
    )
      return;
    const jumlahPinjam = parseInt(formPinjam.jumlah) || 0;

    // kurangi stok saat dipinjam (tidak boleh negatif)
    if (formPinjam.jenis === "Alat") {
      setAlat(
        alat.map((a) =>
          a.nama === formPinjam.namaItem
            ? { ...a, baik: Math.max(a.baik - jumlahPinjam, 0) }
            : a
        )
      );
    } else {
      setBahan(
        bahan.map((b) =>
          b.nama === formPinjam.namaItem
            ? { ...b, jumlah: Math.max(b.jumlah - jumlahPinjam, 0) }
            : b
        )
      );
    }

    setPeminjaman([
      ...peminjaman,
      {
        ...formPinjam,
        jumlah: jumlahPinjam,
        id: Date.now(),
        tanggalKembali: null,
      },
    ]);
    setFormPinjam({
      peminjam: "",
      jenis: "Alat",
      namaItem: "",
      jumlah: "",
      tanggalPinjam: getTodayDate(),
    });
  };

  const handleHapusPinjam = (id) => {
    const p = peminjaman.find((pj) => pj.id === id);
    if (!p) return;
    // jika belum dikembalikan, kembalikan stok saat dihapus
    if (!p.tanggalKembali) {
      if (p.jenis === "Alat") {
        setAlat(
          alat.map((a) =>
            a.nama === p.namaItem ? { ...a, baik: a.baik + p.jumlah } : a
          )
        );
      } else {
        setBahan(
          bahan.map((b) =>
            b.nama === p.namaItem ? { ...b, jumlah: b.jumlah + p.jumlah } : b
          )
        );
      }
    }
    setPeminjaman(peminjaman.filter((pj) => pj.id !== id));
  };

  const startReturn = (id) => {
    setReturnId(id);
    setReturnDate("");
  };

  const handleReturn = () => {
    if (!returnDate || !returnId) return;
    const p = peminjaman.find((pj) => pj.id === returnId);
    if (!p) return;

    if (!p.tanggalKembali) {
      // Tidak perlu kembalikan stok, hanya mencatat tanggal kembali
    }

    setPeminjaman(
      peminjaman.map((pj) =>
        pj.id === returnId ? { ...pj, tanggalKembali: returnDate } : pj
      )
    );

    setReturnId(null);
    setReturnDate("");
  };

  // --- Filtered Data (untuk Search dan Filter) ---
  const filteredAlat = alat.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchAlat.toLowerCase()) ||
      item.lokasi.toLowerCase().includes(searchAlat.toLowerCase());
    const matchesFilter =
      filterAlatLab === "Semua" || item.lab === filterAlatLab;
    return matchesSearch && matchesFilter;
  });

  const filteredBahan = bahan.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchBahan.toLowerCase()) ||
      item.simbol.toLowerCase().includes(searchBahan.toLowerCase()) ||
      item.lokasi.toLowerCase().includes(searchBahan.toLowerCase());
    const matchesFilter =
      filterBahanLab === "Semua" || item.lab === filterBahanLab;
    return matchesSearch && matchesFilter;
  });

  const filteredPeminjaman = peminjaman.filter((item) => {
    const matchesSearch = item.namaItem
      .toLowerCase()
      .includes(searchPeminjaman.toLowerCase());
    const matchesJenis =
      filterPeminjamanJenis === "Semua" || item.jenis === filterPeminjamanJenis;
    const matchesStatus =
      filterPeminjamanStatus === "Semua" ||
      (filterPeminjamanStatus === "Belum Kembali" && !item.tanggalKembali) ||
      (filterPeminjamanStatus === "Sudah Kembali" && item.tanggalKembali);
    return matchesSearch && matchesJenis && matchesStatus;
  });

  // --- Export Excel ---
  const exportData = (data, name) => {
    const ws = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        ...item,
        is_expired: item.is_expired ? "Kadaluarsa" : "Tidak Kadaluarsa",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${name}.xlsx`);
  };

  // --- Chart Dashboard ---
  const chartData = {
    labels: ["Alat Baik", "Alat Rusak", "Bahan Tersedia", "Bahan Kadaluarsa"],
    datasets: [
      {
        data: [
          alat.reduce((a, b) => a + (b.baik || 0), 0),
          alat.reduce((a, b) => a + (b.rusak || 0), 0),
          bahan.reduce((a, b) => a + (b.jumlah || 0), 0),
          bahan.filter((b) => b.is_expired).length,
        ],
        backgroundColor: ["#3b82f6", "#ef4444", "#22c55e", "#f97316"],
      },
    ],
  };

  // --- Laporan per Lab ---
  const labs = ["Biologi", "Fisika", "Kimia"];
  const alatPerLab = (lab) => alat.filter((a) => a.lab === lab);
  const bahanPerLab = (lab) => bahan.filter((b) => b.lab === lab);
  const chartPerLab = (lab) => {
    const a = alatPerLab(lab);
    const b = bahanPerLab(lab);
    return {
      labels: ["Alat Baik", "Alat Rusak", "Bahan Tersedia", "Bahan Kadaluarsa"],
      datasets: [
        {
          data: [
            a.reduce((s, v) => s + (v.baik || 0), 0),
            a.reduce((s, v) => s + (v.rusak || 0), 0),
            b.reduce((s, v) => s + (v.jumlah || 0), 0),
            b.filter((v) => v.is_expired).length,
          ],
          backgroundColor: ["#3b82f6", "#ef4444", "#22c55e", "#f97316"],
        },
      ],
    };
  };

  // --- Fungsi Pembantu untuk Laporan Penggunaan ---
  const peminjamanPerLab = (peminjamanData, lab, jenis) => {
    return peminjamanData.filter((p) => {
      if (p.jenis === "Alat" && jenis === "Alat") {
        const item = alat.find((a) => a.nama === p.namaItem && a.lab === lab);
        return !!item;
      }
      if (p.jenis === "Bahan" && jenis === "Bahan") {
        const item = bahan.find((b) => b.nama === p.namaItem && b.lab === lab);
        return !!item;
      }
      return false;
    });
  };

  return (
    <div className="app">
      <div className="sidebar">
        <h2>Inventaris MAN 1 Bone</h2>
        <ul>
          <li
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </li>
          <li
            className={activeTab === "alat" ? "active" : ""}
            onClick={() => setActiveTab("alat")}
          >
            Alat
          </li>
          <li
            className={activeTab === "bahan" ? "active" : ""}
            onClick={() => setActiveTab("bahan")}
          >
            Bahan
          </li>
          <li
            className={activeTab === "peminjaman" ? "active" : ""}
            onClick={() => setActiveTab("peminjaman")}
          >
            Peminjaman
          </li>
          <li
            className={activeTab === "laporan" ? "active" : ""}
            onClick={() => setActiveTab("laporan")}
          >
            Pelaporan
          </li>
        </ul>
      </div>

      <main className="content">
        <header>
          <h1>Inventaris Laboratorium MAN 1 Bone</h1>
        </header>

        {activeTab === "dashboard" && (
          <div className="dashboard">
            <h2>Dashboard</h2>
            <div className="chart-container">
              <Pie data={chartData} />
            </div>
          </div>
        )}

        {activeTab === "alat" && (
          <div>
            <h2>Data Alat</h2>
            <div className="filters-container">
              <input
                type="text"
                placeholder="Cari nama alat/lokasi..."
                value={searchAlat}
                onChange={(e) => setSearchAlat(e.target.value)}
              />
              <select
                value={filterAlatLab}
                onChange={(e) => setFilterAlatLab(e.target.value)}
              >
                <option value="Semua">Semua Lab</option>
                <option value="Biologi">Biologi</option>
                <option value="Fisika">Fisika</option>
                <option value="Kimia">Kimia</option>
              </select>
            </div>
            <div className="form">
              <input
                placeholder="Nama Alat"
                value={formAlat.nama}
                onChange={(e) =>
                  setFormAlat({ ...formAlat, nama: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Jumlah Baik"
                value={formAlat.baik}
                onChange={(e) =>
                  setFormAlat({ ...formAlat, baik: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Jumlah Rusak"
                value={formAlat.rusak}
                onChange={(e) =>
                  setFormAlat({ ...formAlat, rusak: e.target.value })
                }
              />
              <input
                type="date"
                value={formAlat.tanggal}
                onChange={(e) =>
                  setFormAlat({ ...formAlat, tanggal: e.target.value })
                }
              />
              <select
                value={formAlat.lab}
                onChange={(e) =>
                  setFormAlat({ ...formAlat, lab: e.target.value })
                }
              >
                <option value="">Pilih Lab</option>
                <option value="Biologi">Biologi</option>
                <option value="Fisika">Fisika</option>
                <option value="Kimia">Kimia</option>
              </select>
              <input
                placeholder="Lokasi (mis: Lemari A, Rak 2)"
                value={formAlat.lokasi}
                onChange={(e) =>
                  setFormAlat({ ...formAlat, lokasi: e.target.value })
                }
              />
              <button
                className={editAlatId ? "save" : ""}
                onClick={handleTambahAlat}
              >
                {editAlatId ? "Simpan" : "Tambah"}
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Baik</th>
                  <th>Rusak</th>
                  <th>Tanggal</th>
                  <th>Lab</th>
                  <th>Lokasi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlat.map((a) => (
                  <tr key={a.id}>
                    <td>{a.nama}</td>
                    <td>{a.baik}</td>
                    <td>{a.rusak}</td>
                    <td>{formatDate(a.tanggal)}</td>
                    <td>{a.lab}</td>
                    <td>{a.lokasi}</td>
                    <td>
                      <button
                        className="edit"
                        onClick={() => handleEditAlat(a)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete"
                        onClick={() => handleHapusAlat(a.id)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="export-btn"
              onClick={() => exportData(filteredAlat, "Alat")}
            >
              Export Excel Alat
            </button>
          </div>
        )}

        {activeTab === "bahan" && (
          <div>
            <h2>Data Bahan</h2>
            <div className="filters-container">
              <input
                type="text"
                placeholder="Cari nama/simbol/lokasi..."
                value={searchBahan}
                onChange={(e) => setSearchBahan(e.target.value)}
              />
              <select
                value={filterBahanLab}
                onChange={(e) => setFilterBahanLab(e.target.value)}
              >
                <option value="Semua">Semua Lab</option>
                <option value="Biologi">Biologi</option>
                <option value="Fisika">Fisika</option>
                <option value="Kimia">Kimia</option>
              </select>
            </div>
            <div className="form">
              <input
                placeholder="Nama Bahan"
                value={formBahan.nama}
                onChange={(e) =>
                  setFormBahan({ ...formBahan, nama: e.target.value })
                }
              />
              <input
                placeholder="Simbol/Unsur"
                value={formBahan.simbol}
                onChange={(e) =>
                  setFormBahan({ ...formBahan, simbol: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Jumlah"
                value={formBahan.jumlah}
                onChange={(e) =>
                  setFormBahan({ ...formBahan, jumlah: e.target.value })
                }
              />
              <select
                value={formBahan.is_expired}
                onChange={(e) =>
                  setFormBahan({ ...formBahan, is_expired: e.target.value })
                }
              >
                <option value="false">Tidak Kadaluarsa</option>
                <option value="true">Kadaluarsa</option>
              </select>
              <select
                value={formBahan.satuan}
                onChange={(e) =>
                  setFormBahan({ ...formBahan, satuan: e.target.value })
                }
              >
                <option value="">Satuan</option>
                <option value="gram">Gram</option>
                <option value="kg">Kg</option>
                <option value="liter">Liter</option>
                <option value="ml">ml</option>
              </select>
              <input
                type="date"
                value={formBahan.tanggal}
                onChange={(e) =>
                  setFormBahan({ ...formBahan, tanggal: e.target.value })
                }
              />
              <select
                value={formBahan.lab}
                onChange={(e) =>
                  setFormBahan({ ...formBahan, lab: e.target.value })
                }
              >
                <option value="">Pilih Lab</option>
                <option value="Biologi">Biologi</option>
                <option value="Fisika">Fisika</option>
                <option value="Kimia">Kimia</option>
              </select>
              <input
                placeholder="Lokasi (mis: Lemari B, Rak 3)"
                value={formBahan.lokasi}
                onChange={(e) =>
                  setFormBahan({ ...formBahan, lokasi: e.target.value })
                }
              />
              <button
                className={editBahanId ? "save" : ""}
                onClick={handleTambahBahan}
              >
                {editBahanId ? "Simpan" : "Tambah"}
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Simbol</th>
                  <th>Jumlah</th>
                  <th>Kadaluarsa</th>
                  <th>Satuan</th>
                  <th>Tanggal</th>
                  <th>Lab</th>
                  <th>Lokasi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredBahan.map((b) => (
                  <tr key={b.id}>
                    <td>{b.nama}</td>
                    <td>{b.simbol}</td>
                    <td>{b.jumlah}</td>
                    <td>{b.is_expired ? "Kadaluarsa" : "Tidak Kadaluarsa"}</td>
                    <td>{b.satuan}</td>
                    <td>{formatDate(b.tanggal)}</td>
                    <td>{b.lab}</td>
                    <td>{b.lokasi}</td>
                    <td>
                      <button
                        className="edit"
                        onClick={() => handleEditBahan(b)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete"
                        onClick={() => handleHapusBahan(b.id)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="export-btn"
              onClick={() => exportData(filteredBahan, "Bahan")}
            >
              Export Excel Bahan
            </button>
          </div>
        )}

        {activeTab === "peminjaman" && (
          <div>
            <h2>Data Peminjaman</h2>
            <div className="filters-container">
              <input
                type="text"
                placeholder="Cari nama peminjam/item..."
                value={searchPeminjaman}
                onChange={(e) => setSearchPeminjaman(e.target.value)}
              />
              <select
                value={filterPeminjamanJenis}
                onChange={(e) => setFilterPeminjamanJenis(e.target.value)}
              >
                <option value="Semua">Semua Jenis</option>
                <option value="Alat">Alat</option>
                <option value="Bahan">Bahan</option>
              </select>
              <select
                value={filterPeminjamanStatus}
                onChange={(e) => setFilterPeminjamanStatus(e.target.value)}
              >
                <option value="Semua">Semua Status</option>
                <option value="Sudah Kembali">Sudah Kembali</option>
                <option value="Belum Kembali">Belum Kembali</option>
              </select>
            </div>
            <div className="form">
              <input
                placeholder="Peminjam"
                value={formPinjam.peminjam}
                onChange={(e) =>
                  setFormPinjam({ ...formPinjam, peminjam: e.target.value })
                }
              />
              <select
                value={formPinjam.jenis}
                onChange={(e) =>
                  setFormPinjam({ ...formPinjam, jenis: e.target.value })
                }
              >
                <option value="Alat">Alat</option>
                <option value="Bahan">Bahan</option>
              </select>
              <input
                placeholder="Nama Alat/Bahan"
                value={formPinjam.namaItem}
                onChange={(e) =>
                  setFormPinjam({ ...formPinjam, namaItem: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Jumlah"
                value={formPinjam.jumlah}
                onChange={(e) =>
                  setFormPinjam({ ...formPinjam, jumlah: e.target.value })
                }
              />
              <input
                type="date"
                value={formPinjam.tanggalPinjam}
                onChange={(e) =>
                  setFormPinjam({
                    ...formPinjam,
                    tanggalPinjam: e.target.value,
                  })
                }
              />
              <button onClick={handlePinjam}>Tambah Peminjaman</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Peminjam</th>
                  <th>Jenis</th>
                  <th>Nama</th>
                  <th>Jumlah</th>
                  <th>Tanggal Pinjam</th>
                  <th>Tanggal Kembali</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredPeminjaman.map((p) => (
                  <tr key={p.id}>
                    <td>{p.peminjam}</td>
                    <td>{p.jenis}</td>
                    <td>{p.namaItem}</td>
                    <td>{p.jumlah}</td>
                    <td>{formatDate(p.tanggalPinjam)}</td>
                    <td>{formatDate(p.tanggalKembali) || "-"}</td>
                    <td>
                      {!p.tanggalKembali && returnId !== p.id && (
                        <button
                          className="edit"
                          onClick={() => startReturn(p.id)}
                        >
                          Kembalikan
                        </button>
                      )}
                      {returnId === p.id && (
                        <div className="return-form">
                          <input
                            type="date"
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                          />
                          <button className="edit" onClick={handleReturn}>
                            Simpan
                          </button>
                        </div>
                      )}
                      <button
                        className="delete"
                        onClick={() => handleHapusPinjam(p.id)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="export-btn"
              onClick={() => exportData(filteredPeminjaman, "Peminjaman")}
            >
              Export Excel Peminjaman
            </button>
          </div>
        )}

        {activeTab === "laporan" && (
          <div>
            <h2>Pelaporan Per Laboratorium</h2>
            {labs.map((lab) => (
              <div key={lab} className="report-card">
                <h3>{lab}</h3>
                <div className="chart-container">
                  <Pie data={chartPerLab(lab)} />
                </div>
                <h4>Ringkasan Inventaris</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Jumlah</th>
                      <th>Kondisi</th>
                      <th>Lokasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alatPerLab(lab).map((a) => (
                      <tr key={a.id}>
                        <td>{a.nama}</td>
                        <td>{a.baik + a.rusak}</td>
                        <td>{`Baik: ${a.baik}, Rusak: ${a.rusak}`}</td>
                        <td>{a.lokasi}</td>
                      </tr>
                    ))}
                    {bahanPerLab(lab).map((b) => (
                      <tr key={b.id}>
                        <td>{b.nama}</td>
                        <td>{`${b.jumlah} ${b.satuan}`}</td>
                        <td>
                          {b.is_expired ? "Kadaluarsa" : "Tidak Kadaluarsa"}
                        </td>
                        <td>{b.lokasi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h4>Penggunaan Alat</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Nama Alat</th>
                      <th>Peminjam</th>
                      <th>Jumlah</th>
                      <th>Tanggal Pinjam</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {peminjamanPerLab(peminjaman, lab, "Alat").map((p) => (
                      <tr key={p.id}>
                        <td>{p.namaItem}</td>
                        <td>{p.peminjam}</td>
                        <td>{p.jumlah}</td>
                        <td>{formatDate(p.tanggalPinjam)}</td>
                        <td>
                          {p.tanggalKembali ? "Sudah Kembali" : "Belum Kembali"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h4>Penggunaan Bahan</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Nama Bahan</th>
                      <th>Peminjam</th>
                      <th>Jumlah</th>
                      <th>Tanggal Pinjam</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {peminjamanPerLab(peminjaman, lab, "Bahan").map((p) => (
                      <tr key={p.id}>
                        <td>{p.namaItem}</td>
                        <td>{p.peminjam}</td>
                        <td>{p.jumlah}</td>
                        <td>{formatDate(p.tanggalPinjam)}</td>
                        <td>
                          {p.tanggalKembali ? "Sudah Kembali" : "Belum Kembali"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  className="export-btn"
                  onClick={() =>
                    exportData(
                      [
                        ...alatPerLab(lab),
                        ...bahanPerLab(lab),
                        ...peminjamanPerLab(peminjaman, lab, "Alat"),
                        ...peminjamanPerLab(peminjaman, lab, "Bahan"),
                      ],
                      `${lab}_Laporan`
                    )
                  }
                >
                  Export Excel {lab}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;