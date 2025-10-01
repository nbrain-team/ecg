import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

type Cell = string | number | boolean | null;

function BudgetEditor() {
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [data, setData] = useState<Cell[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const defaultUrl = '/budgets/Esler%202023%20Proposal%20Budget%20(1).xlsx';

  useEffect(() => {
    const loadDefault = async () => {
      try {
        setLoading(true);
        setError('');
        // Try to fetch default XLSX from public folder
        const res = await fetch(defaultUrl, { cache: 'no-cache' });
        const ctype = (res.headers.get('content-type') || '').toLowerCase();
        if (!res.ok || ctype.includes('text/html')) {
          throw new Error('Default budget file not found. Please upload an XLSX or CSV.');
        }
        const buf = await res.arrayBuffer();
        parseWorkbook(buf);
      } catch (e: any) {
        setError(e.message || 'Unable to load default file. Please upload an XLSX or CSV.');
        setLoading(false);
      }
    };
    loadDefault();
  }, []);

  const parseWorkbook = (buf: ArrayBuffer) => {
    const wb = XLSX.read(buf, { type: 'array' });
    const sheets = wb.SheetNames || [];
    setSheetNames(sheets);
    const first = sheets[0];
    setActiveSheet(first || '');
    if (first) {
      const ws = wb.Sheets[first];
      const aoa: Cell[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true }) as Cell[][];
      setData(aoa);
    } else {
      setData([]);
    }
    setLoading(false);
  };

  const parseCsvText = (text: string) => {
    const wb = XLSX.read(text, { type: 'string' });
    const sheets = wb.SheetNames || [];
    setSheetNames(sheets);
    const first = sheets[0];
    setActiveSheet(first || '');
    if (first) {
      const ws = wb.Sheets[first];
      const aoa: Cell[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true }) as Cell[][];
      setData(aoa);
    } else {
      setData([]);
    }
    setLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError('');
    const name = (file.name || '').toLowerCase();
    const isCsv = name.endsWith('.csv') || file.type === 'text/csv';
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (isCsv) {
          const text = reader.result as string;
          parseCsvText(text);
        } else {
          const buf = reader.result as ArrayBuffer;
          parseWorkbook(buf);
        }
      } catch (err: any) {
        const msg = (err?.message || '').toLowerCase();
        if (msg.includes('invalid html') || msg.includes('could not find <table')) {
          setError('That looks like an HTML file. Please upload an XLSX or CSV.');
        } else {
          setError('Unsupported file. Please upload an XLSX or CSV.');
        }
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setLoading(false);
    };
    if (isCsv) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const headers: string[] = useMemo(() => {
    if (!data || data.length === 0) return [];
    return (data[0] as Cell[]).map((c, i) => (c === null ? '' : String(c || `Column ${i + 1}`)));
  }, [data]);

  const rows: Cell[][] = useMemo(() => {
    if (!data || data.length <= 1) return [];
    return data.slice(1);
  }, [data]);

  const updateCell = (rowIdx: number, colIdx: number, value: string) => {
    setData(prev => {
      const copy = prev.map(r => [...r]);
      const actualRow = rowIdx + 1; // account for header row at index 0
      if (!copy[actualRow]) copy[actualRow] = [];
      copy[actualRow][colIdx] = value;
      return copy;
    });
  };

  const downloadCsv = () => {
    // Convert current AOA to CSV
    const ws = XLSX.utils.aoa_to_sheet(data as any);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (activeSheet || 'budget') + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#0f172a', color: '#fff', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontWeight: 600 }}>Budget Editor</div>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} style={{ background: '#fff', color: '#0f172a', borderRadius: 6, padding: '6px 8px' }} />
        {sheetNames.length > 0 && (
          <select
            value={activeSheet}
            onChange={(e) => setActiveSheet(e.target.value)}
            style={{ background: '#0b1220', color: '#fff', border: '1px solid #334155', borderRadius: 6, padding: '6px 8px' }}
          >
            {sheetNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        )}
        <button onClick={downloadCsv} style={{ marginLeft: 'auto', background: '#22c55e', color: '#0f172a', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Download CSV</button>
      </div>

      <div style={{ padding: 16 }}>
        {loading && (
          <div style={{ color: '#64748b' }}>Loading spreadsheet…</div>
        )}
        {!!error && (
          <div style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</div>
        )}

        {!loading && data && data.length > 0 && (
          <div style={{ width: '100%', overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                <tr>
                  {headers.map((h, idx) => (
                    <th key={idx} style={{ textAlign: 'left', fontWeight: 600, fontSize: 12, color: '#0f172a', padding: '10px 12px', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, rIdx) => (
                  <tr key={rIdx}>
                    {headers.map((_, cIdx) => (
                      <td key={cIdx} style={{ padding: '6px 10px', borderBottom: '1px solid #f1f5f9' }}>
                        <input
                          value={r[cIdx] !== undefined && r[cIdx] !== null ? String(r[cIdx]) : ''}
                          onChange={(e) => updateCell(rIdx, cIdx, e.target.value)}
                          style={{ width: '100%', border: '1px solid #e2e8f0', background: '#fff', borderRadius: 4, padding: '6px 8px', fontSize: 12 }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default BudgetEditor;


