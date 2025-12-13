import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { Parser } from '@json2csv/plainjs';

const CSV_PATH = path.join(process.cwd(), 'la_tinta_precios_superficie.csv');

// Helper to read CSV
function readCSV(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// Helper to write CSV
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

// GET: Get all prices
export async function GET() {
  try {
    const data = await readCSV();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al leer los precios', details: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update a price
export async function PUT(request: Request) {
  try {
    const data = await readCSV();
    const { paper_id, measure_label, price_clp } = await request.json();

    const index = data.findIndex(
      (item) => item.paper_id === paper_id && item.measure_label === measure_label
    );

    if (index !== -1) {
      data[index].price_clp = price_clp;
      data[index].price_display = new Intl.NumberFormat('es-CL').format(price_clp);
      await writeCSV(data);
      return NextResponse.json({ success: true, updated: data[index] });
    } else {
      return NextResponse.json({ error: 'Precio no encontrado' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al actualizar precio', details: error.message },
      { status: 500 }
    );
  }
}

// POST: Add new price entry
export async function POST(request: Request) {
  try {
    const data = await readCSV();
    const body = await request.json();
    const newEntry = {
      ...body,
      price_display: new Intl.NumberFormat('es-CL').format(body.price_clp),
    };
    data.push(newEntry);
    await writeCSV(data);
    return NextResponse.json({ success: true, added: newEntry });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al agregar precio', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a price
export async function DELETE(request: Request) {
  try {
    const data = await readCSV();
    const { paper_id, measure_label } = await request.json();

    const filtered = data.filter(
      (item) => !(item.paper_id === paper_id && item.measure_label === measure_label)
    );

    if (filtered.length < data.length) {
      await writeCSV(filtered);
      return NextResponse.json({ success: true, message: 'Precio eliminado' });
    } else {
      return NextResponse.json({ error: 'Precio no encontrado' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al eliminar precio', details: error.message },
      { status: 500 }
    );
  }
}
