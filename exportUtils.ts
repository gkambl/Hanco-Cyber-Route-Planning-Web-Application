import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { GraphNode, GraphData } from './types';

export async function exportToPNG(elementId: string, filename: string) {
  const element = document.querySelector(elementId);
  if (!element) {
    console.error('Element not found');
    return;
  }

  try {
    const dataUrl = await toPng(element as HTMLElement, {
      cacheBust: true,
      backgroundColor: '#ffffff',
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Failed to export PNG:', error);
    alert('Failed to export PNG');
  }
}

export async function exportToPDF(elementId: string, filename: string) {
  const element = document.querySelector(elementId);
  if (!element) {
    console.error('Element not found');
    return;
  }

  try {
    const dataUrl = await toPng(element as HTMLElement, {
      cacheBust: true,
      backgroundColor: '#ffffff',
    });

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [1920, 1080],
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, 1920, 1080);
    pdf.save(filename);
  } catch (error) {
    console.error('Failed to export PDF:', error);
    alert('Failed to export PDF');
  }
}

export function exportToCSV(nodes: GraphNode[], filename: string) {
  const headers = [
    'ID',
    'Title',
    'Type',
    'Cloud',
    'Status',
    'Risk (Avg)',
    'Impact',
    'Likelihood',
    'Exposure',
    'Frameworks',
    'Tags',
  ];

  const rows = nodes.map((node) => {
    const avgRisk = (node.risk.impact + node.risk.likelihood + node.risk.exposure) / 3;
    const frameworks = node.frameworks?.map((f) => `${f.framework}:${f.id}`).join('; ') || '';
    const tags = node.tags?.join('; ') || '';

    return [
      node.id,
      `"${node.title}"`,
      node.type,
      node.cloud || '',
      node.status,
      avgRisk.toFixed(2),
      node.risk.impact,
      node.risk.likelihood,
      node.risk.exposure,
      `"${frameworks}"`,
      `"${tags}"`,
    ];
  });

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportGraphJSON(data: GraphData, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
