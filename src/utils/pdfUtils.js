import html2pdf from 'html2pdf.js'
/**
 * Genera y descarga un PDF con la info escolar y el horario tipo tabla.
 * @param {Object} data - Objeto con institution, period, campus, semestre, grupo, turno.
 */
export function generateSchoolInfoPDF(data) {
  console.log('Datos recibidos en PDF:', data)

  const pdfContent = document.createElement('div')
  pdfContent.style.fontFamily = 'Arial'
  pdfContent.style.fontSize = '12pt'

  const {
    institution = '-',
    period = '-',
    campus = '-',
    semestre = 'Cuarto',
    grupo = '402B',
    turno = 'matutino',
  } = data || {}

  pdfContent.innerHTML = `
    <div style="margin:0;margin-bottom:16px;padding:0;text-align:center;">
      <div>${institution || '-'}</div>
      <div>Periodo ${period || '-'}</div>
      <div>Plantel ${campus || '-'}</div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-family: Arial; font-size: 13pt;">
      <div>${semestre || 'Primer'} semestre ${grupo || '108G'}</div>
      <div>Turno ${turno || 'vespertino'}</div>
    </div>
    <table style="width: 100%; border-collapse: collapse; font-family: Arial; font-size: 11pt;">
      <thead>
        <tr>
          <th style="border: 1px solid #000; background: #f2f2f2; padding: 4px;">TIEMPO</th>
          <th style="border: 1px solid #000; background: #f2f2f2; padding: 4px;">HORA</th>
          <th style="border: 1px solid #000; background: #f2f2f2; padding: 4px;">LUNES</th>
          <th style="border: 1px solid #000; background: #f2f2f2; padding: 4px;">MARTES</th>
          <th style="border: 1px solid #000; background: #f2f2f2; padding: 4px;">MIÉRCOLES</th>
          <th style="border: 1px solid #000; background: #f2f2f2; padding: 4px;">JUEVES</th>
          <th style="border: 1px solid #000; background: #f2f2f2; padding: 4px;">VIERNES</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #000; padding: 2px; text-align: center;">1</td>
          <td style="border: 1px solid #000; padding: 2px; text-align: center;">7:00 a 7:50</td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>A. Martínez</strong></div><div>TEMS DE FLS</div><div style="font-size: 8pt;">Aula 1</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>C. Torres</strong></div><div>MATEMÁTICAS</div><div style="font-size: 8pt;">Aula 2</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>D. Pérez</strong></div><div>QUÍMICA</div><div style="font-size: 8pt;">Aula 1</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>B. López</strong></div><div>BIOLOGÍA</div><div style="font-size: 8pt;">Lab 2</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>E. Ruiz</strong></div><div>HISTORIA</div><div style="font-size: 8pt;">Aula 3</div></td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 2px; text-align: center;">2</td>
          <td style="border: 1px solid #000; padding: 2px; text-align: center;">7:50 a 8:40</td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>F. Smith</strong></div><div>INGLÉS</div><div style="font-size: 8pt;">Aula 4</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>B. López</strong></div><div>BIOLOGÍA</div><div style="font-size: 8pt;">Lab 2</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>G. Díaz</strong></div><div>FÍSICA</div><div style="font-size: 8pt;">Lab 3</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>H. Soto</strong></div><div>ÉTICA</div><div style="font-size: 8pt;">Aula 5</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>I. Lara</strong></div><div>TECNOLOGÍA</div><div style="font-size: 8pt;">Aula 6</div></td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 2px; text-align: center;">3</td>
          <td style="border: 1px solid #000; padding: 2px; text-align: center;">8:40 a 9:10</td>
          <td colspan="5" style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">RECESO</td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 2px; text-align: center;">4</td>
          <td style="border: 1px solid #000; padding: 2px; text-align: center;">9:10 a 10:00</td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>A. Martínez</strong></div><div>TEMS DE FLS</div><div style="font-size: 8pt;">Aula 1</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>C. Torres</strong></div><div>MATEMÁTICAS</div><div style="font-size: 8pt;">Aula 2</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>D. Pérez</strong></div><div>QUÍMICA</div><div style="font-size: 8pt;">Aula 1</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>B. López</strong></div><div>BIOLOGÍA</div><div style="font-size: 8pt;">Lab 2</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>E. Ruiz</strong></div><div>HISTORIA</div><div style="font-size: 8pt;">Aula 3</div></td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 2px; text-align: center;">5</td>
          <td style="border: 1px solid #000; padding: 2px; text-align: center;">10:00 a 10:50</td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>F. Smith</strong></div><div>INGLÉS</div><div style="font-size: 8pt;">Aula 4</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>B. López</strong></div><div>BIOLOGÍA</div><div style="font-size: 8pt;">Lab 2</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>G. Díaz</strong></div><div>FÍSICA</div><div style="font-size: 8pt;">Lab 3</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>H. Soto</strong></div><div>ÉTICA</div><div style="font-size: 8pt;">Aula 5</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>I. Lara</strong></div><div>TECNOLOGÍA</div><div style="font-size: 8pt;">Aula 6</div></td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 2px; text-align: center;">6</td>
          <td style="border: 1px solid #000; padding: 2px; text-align: center;">10:50 a 11:40</td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>A. Martínez</strong></div><div>TEMS DE FLS</div><div style="font-size: 8pt;">Aula 1</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>C. Torres</strong></div><div>MATEMÁTICAS</div><div style="font-size: 8pt;">Aula 2</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>D. Pérez</strong></div><div>QUÍMICA</div><div style="font-size: 8pt;">Aula 1</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>B. López</strong></div><div>BIOLOGÍA</div><div style="font-size: 8pt;">Lab 2</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>E. Ruiz</strong></div><div>HISTORIA</div><div style="font-size: 8pt;">Aula 3</div></td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 2px; text-align: center;">7</td>
          <td style="border: 1px solid #000; padding: 2px; text-align: center;">11:40 a 12:30</td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>F. Smith</strong></div><div>INGLÉS</div><div style="font-size: 8pt;">Aula 4</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>B. López</strong></div><div>BIOLOGÍA</div><div style="font-size: 8pt;">Lab 2</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>G. Díaz</strong></div><div>FÍSICA</div><div style="font-size: 8pt;">Lab 3</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>H. Soto</strong></div><div>ÉTICA</div><div style="font-size: 8pt;">Aula 5</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>I. Lara</strong></div><div>TECNOLOGÍA</div><div style="font-size: 8pt;">Aula 6</div></td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 2px; text-align: center;">8</td>
          <td style="border: 1px solid #000; padding: 4px; text-align: center;">12:30 a 13:20</td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>A. Martínez</strong></div><div>TEMS DE FLS</div><div style="font-size: 8pt;">Aula 1</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>C. Torres</strong></div><div>MATEMÁTICAS</div><div style="font-size: 8pt;">Aula 2</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>D. Pérez</strong></div><div>QUÍMICA</div><div style="font-size: 8pt;">Aula 1</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>B. López</strong></div><div>BIOLOGÍA</div><div style="font-size: 8pt;">Lab 2</div></td>
          <td style="border: 1px solid #000; padding: 4px;"><div><strong>E. Ruiz</strong></div><div>HISTORIA</div><div style="font-size: 8pt;">Aula 3</div></td>
        </tr>
      </tbody>
    </table>
  `

  const opt = {
    margin: 15,
    filename: `horario_${semestre || '<'}_${grupo || '3'}_${Date.now()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' },
  }
  html2pdf().set(opt).from(pdfContent).save()
}
