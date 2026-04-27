// src/devtools/views/Map.ts
// d3-force graph

export function renderMap(store: any, opts: any): string {
  // render a container — d3 will populate it
  setTimeout(() => initD3Graph(store, opts), 0)

  return `
    <div class="map-view">
      <svg id="engine-map-svg" width="100%" height="100%">
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8"
            refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#444" />
          </marker>
        </defs>
        <g id="engine-map-g"></g>
      </svg>
      <div class="map-legend">
        <span class="legend-item">
          <span class="legend-dot component"></span> Component
        </span>
        <span class="legend-item">
          <span class="legend-dot state"></span> State
        </span>
      </div>
    </div>
  `
}

async function initD3Graph(store: any, opts: any) {
  // load d3 dynamically from CDN — no install needed in devtools
  // @ts-ignore — remote ESM, no type declarations
  const d3 = await import('https://cdn.jsdelivr.net/npm/d3@7/+esm')

  const svg   = document.getElementById('engine-map-svg')
  const g     = document.getElementById('engine-map-g')
  if (!svg || !g) return

  const width  = svg.clientWidth  || 600
  const height = svg.clientHeight || 500

  // build nodes and links
  const nodes: any[] = []
  const links: any[] = []
  const nodeMap = new Map<string, any>()

  // component nodes
  store.components.forEach((comp: any) => {
    const node = {
      id:      comp.name,
      label:   comp.name,
      file:    comp.file,
      type:    'component',
      mounted: comp.mounted
    }
    nodes.push(node)
    nodeMap.set(comp.name, node)
  })

  // state nodes
  store.state.forEach((s: any) => {
    const node = {
      id:    s.file,
      label: s.shortName,
      file:  s.file,
      type:  'state'
    }
    nodes.push(node)
    nodeMap.set(s.file, node)
  })

  // links — component reads state
  store.components.forEach((comp: any) => {
    comp.reads.forEach((stateFile: string) => {
      links.push({
        source: comp.name,
        target: stateFile
      })
    })
  })

  // d3 force simulation
  const simulation = d3.forceSimulation(nodes)
    .force('link',   d3.forceLink(links).id((d: any) => d.id).distance(120))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide(50))

  const svgEl = d3.select(svg)
  const gEl   = d3.select(g)

  // zoom
  svgEl.call(
    d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event: any) => {
        gEl.attr('transform', event.transform)
      })
  )

  // draw links
  const link = gEl.append('g')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke', '#2a2a2a')
    .attr('stroke-width', 1.5)
    .attr('marker-end', 'url(#arrow)')

  // draw nodes
  const node = gEl.append('g')
    .selectAll('g')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', (d: any) => `map-node map-node-${d.type}`)
    .attr('data-component', (d: any) => d.type === 'component' ? d.id : null)
    .attr('data-state',     (d: any) => d.type === 'state'     ? d.id : null)
    .call(
      d3.drag()
        .on('start', (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event: any, d: any) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        })
    )

  // node background
  node.append('rect')
    .attr('rx',     6)
    .attr('ry',     6)
    .attr('width',  120)
    .attr('height', 44)
    .attr('x',      -60)
    .attr('y',      -22)
    .attr('fill',   (d: any) => d.type === 'component' ? '#1a2d4a' : '#1a2d1a')
    .attr('stroke', (d: any) => d.type === 'component' ? '#4f8ef7' : '#4eca8b')
    .attr('stroke-width', 1)

  // node label
  node.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy',          -4)
    .attr('fill',        (d: any) => d.type === 'component' ? '#7ec8e3' : '#7eca8b')
    .attr('font-size',   '12px')
    .attr('font-family', "'SF Mono', Menlo, Monaco, 'Cascadia Code', monospace")
    .text((d: any) => d.label)

  // node file
  node.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy',          12)
    .attr('fill',        '#666')
    .attr('font-size',   '9px')
    .attr('font-family', "'SF Mono', Menlo, Monaco, 'Cascadia Code', monospace")
    .text((d: any) => d.file.split('/').pop())

  // mounted indicator
  node.filter((d: any) => d.type === 'component' && d.mounted)
    .append('circle')
    .attr('cx', 52)
    .attr('cy', -14)
    .attr('r',   4)
    .attr('fill', '#4eca8b')

  // tick
  simulation.on('tick', () => {
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y)

    node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
  })

  // wire hover listeners
  opts.onHover?.()
}
