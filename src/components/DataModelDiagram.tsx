import { useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

export type Column = { name: string; type: string; key?: string };
export type TableModel = { name: string; columns: Column[] };
export type StarSchemaModel = { fact: TableModel; dimensions: TableModel[] };

function buildLabel(table: TableModel) {
  return (
    <div className="p-2">
      <div className="font-bold text-sm mb-1">{table.name}</div>
      <div className="text-xs space-y-0.5">
        {table.columns.slice(0, 12).map((col, idx) => (
          <div key={idx}>
            {col.key === 'PK' ? '🔑 ' : col.key === 'FK' ? '🔗 ' : ''}
            {col.name}{col.key ? ` (${col.key})` : ''}
          </div>
        ))}
        {table.columns.length > 12 && (
          <div>… {table.columns.length - 12} more</div>
        )}
      </div>
    </div>
  );
}

function generateGraphFromModel(model?: StarSchemaModel): { nodes: Node[]; edges: Edge[] } {
  if (!model) {
    // Fallback demo model matching the previous static example
    const fallback: StarSchemaModel = {
      fact: {
        name: 'fact_sales_promotions',
        columns: [
          { name: 'transaction_id', key: 'PK', type: 'INTEGER' },
          { name: 'campaign_id', key: 'FK', type: 'INTEGER' },
          { name: 'product_id', key: 'FK', type: 'INTEGER' },
          { name: 'customer_id', key: 'FK', type: 'INTEGER' },
          { name: 'date_id', key: 'FK', type: 'INTEGER' },
          { name: 'quantity', type: 'INTEGER' },
          { name: 'revenue', type: 'DECIMAL' },
          { name: 'discount_amount', type: 'DECIMAL' },
        ],
      },
      dimensions: [
        { name: 'dim_campaign', columns: [
          { name: 'campaign_id', key: 'PK', type: 'INTEGER' },
          { name: 'campaign_name', type: 'VARCHAR' },
          { name: 'start_date', type: 'DATE' },
          { name: 'end_date', type: 'DATE' },
          { name: 'budget', type: 'DECIMAL' },
          { name: 'discount_percentage', type: 'DECIMAL' },
        ]},
        { name: 'dim_product', columns: [
          { name: 'product_id', key: 'PK', type: 'INTEGER' },
          { name: 'product_name', type: 'VARCHAR' },
          { name: 'category', type: 'VARCHAR' },
          { name: 'price', type: 'DECIMAL' },
        ]},
        { name: 'dim_customer', columns: [
          { name: 'customer_id', key: 'PK', type: 'INTEGER' },
          { name: 'customer_name', type: 'VARCHAR' },
          { name: 'email', type: 'VARCHAR' },
          { name: 'segment', type: 'VARCHAR' },
        ]},
        { name: 'dim_date', columns: [
          { name: 'date_id', key: 'PK', type: 'INTEGER' },
          { name: 'full_date', type: 'DATE' },
          { name: 'year', type: 'INTEGER' },
          { name: 'quarter', type: 'INTEGER' },
          { name: 'month', type: 'INTEGER' },
        ]},
      ],
    };
    model = fallback;
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Fact node centered
  nodes.push({
    id: 'fact',
    type: 'default',
    position: { x: 400, y: 200 },
    data: { label: buildLabel(model.fact) },
    style: {
      background: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      border: '2px solid hsl(var(--primary))',
      borderRadius: '8px',
      padding: '10px',
      width: 260,
    },
  });

  const center = { x: 400, y: 200 };
  const radius = 220;
  const count = Math.max(1, model.dimensions.length);
  model.dimensions.forEach((dim, idx) => {
    const angle = (2 * Math.PI * idx) / count;
    const x = center.x + radius * Math.cos(angle);
    const y = center.y + radius * Math.sin(angle);
    const nodeId = `dim_${idx}`;
    nodes.push({
      id: nodeId,
      type: 'default',
      position: { x, y },
      data: { label: buildLabel(dim) },
      style: {
        background: 'hsl(var(--secondary))',
        color: 'hsl(var(--secondary-foreground))',
        border: '2px solid hsl(var(--secondary))',
        borderRadius: '8px',
        padding: '10px',
        width: 200,
      },
    });

    edges.push({
      id: `e-${nodeId}-fact`,
      source: nodeId,
      target: 'fact',
      animated: true,
      style: { stroke: 'hsl(var(--primary))' },
    });
  });

  return { nodes, edges };
}

export default function DataModelDiagram({ model }: { model?: StarSchemaModel }) {
  const generated = useMemo(() => generateGraphFromModel(model), [model]);
  const [nodes, setNodes, onNodesChange] = useNodesState(generated.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(generated.edges);

  useEffect(() => {
    setNodes(generated.nodes);
    setEdges(generated.edges);
  }, [generated.nodes, generated.edges, setNodes, setEdges]);

  return (
    <div className="w-full h-[600px] border border-border rounded-lg bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
