import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { Parser } from '@json2csv/plainjs';

const CSV_PATH = path.join(process.cwd(), 'la_tinta_precios_superficie.csv');

function writeCSV(data: any[]): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const parser = new Parser();
      const csvData = parser.parse(data);
      fs.writeFile(CSV_PATH, csvData, (err) => {
        if (err) reject(err);
        else resolve();
      });
    } catch (err) {
      reject(err);
    }
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Tipo de archivo inválido. Use .xlsx o .xls' },
        { status: 400 }
      );
    }

    // Read file as buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const importedData = XLSX.utils.sheet_to_json(worksheet);

    if (importedData.length === 0) {
      return NextResponse.json(
        { error: 'El archivo Excel está vacío' },
        { status: 400 }
      );
    }

    // Update CSV with imported data
    await writeCSV(importedData);

    return NextResponse.json({
      success: true,
      message: 'Precios actualizados correctamente',
      count: importedData.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al importar Excel', details: error.message },
      { status: 500 }
    );
  }
}
