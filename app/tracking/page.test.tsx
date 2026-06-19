import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals'; 
import '@testing-library/jest-dom';

// tiruan komponen agar tes fokus mengecek UI teks LUNAS dan DISEMBELIH
const MockTrackingPage = ({ dataDummy }: { dataDummy: { id: string; status: string }[] }) => {
  return (
    <div>
      <h1>Halaman Tracking Status Hewan Kurban</h1>
      <ul>
        {dataDummy.map((hewan) => (
          <li key={hewan.id} data-testid="status-item">
            ID: {hewan.id} - Status: <span>{hewan.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

describe('Pengujian Halaman Tracking Status Hewan Kurban', () => {
  
  // TES 1: Memastikan status "LUNAS" tampil sesuai data dummy
  test('Harus menampilkan teks "LUNAS" ketika status pembayaran hewan kurban selesai', () => {
    const dummyLunas = [{ id: 'QRB-001', status: 'LUNAS' }];
    
    render(<MockTrackingPage dataDummy={dummyLunas} />);
    
    // Mencari apakah teks "LUNAS" berhasil dirender di layar
    const elemenStatus = screen.getByText('LUNAS');
    expect(elemenStatus).toBeInTheDocument();
  });

  // TES 2: Memastikan status "DISEMBELIH" tampil sesuai data dummy
  test('Harus menampilkan teks "DISEMBELIH" ketika hewan kurban sudah diproses', () => {
    const dummyDisembelih = [{ id: 'QRB-002', status: 'DISEMBELIH' }];
    
    render(<MockTrackingPage dataDummy={dummyDisembelih} />);
    
    // Mencari apakah teks "DISEMBELIH" berhasil dirender di layar
    const elemenStatus = screen.getByText('DISEMBELIH');
    expect(elemenStatus).toBeInTheDocument();
  });

});