
export interface AlignedPair {
  left: { value: string, type: 'removed' | 'equal' | 'empty' };
  right: { value: string, type: 'added' | 'equal' | 'empty' };
}

export function computeSideBySideDiff(oldStr: string, newStr: string): AlignedPair[] {
  const oldLines = oldStr.split(/></g).map(l => l.includes('<') ? l : `<${l}`).map(l => l.includes('>') ? l : `${l}>`).map(l => l.trim()).filter(Boolean);
  const newLines = newStr.split(/></g).map(l => l.includes('<') ? l : `<${l}`).map(l => l.includes('>') ? l : `${l}>`).map(l => l.trim()).filter(Boolean);
  
  const pairs: AlignedPair[] = [];
  let i = 0, j = 0;

  while (i < oldLines.length || j < newLines.length) {
    const leftLine = oldLines[i];
    const rightLine = newLines[j];

    if (leftLine === rightLine) {
      pairs.push({
        left: { value: leftLine, type: 'equal' },
        right: { value: rightLine, type: 'equal' }
      });
      i++; j++;
    } else {
      // Lookahead to see if we can find a match later
      let foundMatch = false;
      for (let k = 1; k < 5; k++) {
        if (i + k < oldLines.length && oldLines[i + k] === rightLine) {
          // Lines were removed from old
          for(let m=0; m<k; m++) {
            pairs.push({
              left: { value: oldLines[i+m], type: 'removed' },
              right: { value: '', type: 'empty' }
            });
          }
          i += k;
          foundMatch = true;
          break;
        }
        if (j + k < newLines.length && newLines[j + k] === leftLine) {
          // Lines were added to new
          for(let m=0; m<k; m++) {
            pairs.push({
              left: { value: '', type: 'empty' },
              right: { value: newLines[j+m], type: 'added' }
            });
          }
          j += k;
          foundMatch = true;
          break;
        }
      }

      if (!foundMatch) {
         // Direct mismatch or too far to look ahead
         if (i < oldLines.length && j < newLines.length) {
            pairs.push({
              left: { value: leftLine, type: 'removed' },
              right: { value: rightLine, type: 'added' }
            });
            i++; j++;
         } else if (i < oldLines.length) {
            pairs.push({
              left: { value: leftLine, type: 'removed' },
              right: { value: '', type: 'empty' }
            });
            i++;
         } else {
            pairs.push({
              left: { value: '', type: 'empty' },
              right: { value: rightLine, type: 'added' }
            });
            j++;
         }
      }
    }
  }
  
  return pairs;
}

export function renderSideBySide(pairs: AlignedPair[]): string {
  const leftHtml = pairs.map((p, idx) => renderLine(p.left, idx + 1)).join('');
  const rightHtml = pairs.map((p, idx) => renderLine(p.right, idx + 1)).join('');

  return `
    <div style="display:flex; width:100%; height:100%; gap:2px; background:#111; overflow:hidden; border-radius:8px">
      <div style="flex:1; overflow:auto; background:#0a0a0a; border-right:1px solid #222">
        <div style="padding:10px; font-size:9px; color:#555; background:#000; font-weight:900; border-bottom:1px solid #111">BASELINE (EXPECTED)</div>
        ${leftHtml}
      </div>
      <div style="flex:1; overflow:auto; background:#0a0a0a">
        <div style="padding:10px; font-size:9px; color:#555; background:#000; font-weight:900; border-bottom:1px solid #111">CURRENT (ACTUAL)</div>
        ${rightHtml}
      </div>
    </div>
  `;
}

function renderLine(line: { value: string, type: string }, num: number) {
  let bg = 'transparent';
  let color = '#777';
  if (line.type === 'removed') { bg = 'rgba(255,95,86,0.15)'; color = '#ff5f56'; }
  if (line.type === 'added')    { bg = 'rgba(78,202,139,0.15)'; color = '#4eca8b'; }
  if (line.type === 'empty')    { bg = 'rgba(255,255,255,0.02)'; color = 'transparent'; }
  if (line.type === 'equal')    { color = '#999'; }

  return `
    <div style="display:flex; background:${bg}; border-bottom:1px solid rgba(255,255,255,0.02); min-height:20px">
      <div style="width:30px; font-size:9px; color:#333; padding:4px 5px; text-align:right; user-select:none; border-right:1px solid rgba(255,255,255,0.02)">${line.type !== 'empty' ? num : ''}</div>
      <div style="flex:1; font-family:'Roboto Mono', monospace; font-size:11px; color:${color}; padding:4px 10px; white-space:pre-wrap; word-break:break-all">${escapeHtml(line.value || ' ')}</div>
    </div>
  `;
}

function escapeHtml(str: string) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[m] as string);
}
