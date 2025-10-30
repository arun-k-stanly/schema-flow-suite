import { useCallback } from 'react';
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

const initialNodes: Node[] = [
  {
    id: 'fact',
    type: 'default',
    position: { x: 400, y: 200 },
    data: { 
      label: (
        <div className="p-2">
          <div className="font-bold text-sm mb-1">fact_sales_promotions</div>
          <div className="text-xs space-y-0.5">
            <div>🔑 transaction_id (PK)</div>
            <div>🔗 campaign_id (FK)</div>
            <div>🔗 product_id (FK)</div>
            <div>🔗 customer_id (FK)</div>
            <div>🔗 date_id (FK)</div>
            <div>quantity</div>
            <div>revenue</div>
            <div>discount_amount</div>
          </div>
        </div>
      )
    },
    style: {
      background: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      border: '2px solid hsl(var(--primary))',
      borderRadius: '8px',
      padding: '10px',
      width: 220,
    },
  },
  {
    id: 'dim_campaign',
    type: 'default',
    position: { x: 100, y: 50 },
    data: { 
      label: (
        <div className="p-2">
          <div className="font-bold text-sm mb-1">dim_campaign</div>
          <div className="text-xs space-y-0.5">
            <div>🔑 campaign_id (PK)</div>
            <div>campaign_name</div>
            <div>start_date</div>
            <div>end_date</div>
            <div>budget</div>
            <div>discount_percentage</div>
          </div>
        </div>
      )
    },
    style: {
      background: 'hsl(var(--secondary))',
      color: 'hsl(var(--secondary-foreground))',
      border: '2px solid hsl(var(--secondary))',
      borderRadius: '8px',
      padding: '10px',
      width: 180,
    },
  },
  {
    id: 'dim_product',
    type: 'default',
    position: { x: 700, y: 50 },
    data: { 
      label: (
        <div className="p-2">
          <div className="font-bold text-sm mb-1">dim_product</div>
          <div className="text-xs space-y-0.5">
            <div>🔑 product_id (PK)</div>
            <div>product_name</div>
            <div>category</div>
            <div>price</div>
          </div>
        </div>
      )
    },
    style: {
      background: 'hsl(var(--secondary))',
      color: 'hsl(var(--secondary-foreground))',
      border: '2px solid hsl(var(--secondary))',
      borderRadius: '8px',
      padding: '10px',
      width: 160,
    },
  },
  {
    id: 'dim_customer',
    type: 'default',
    position: { x: 100, y: 400 },
    data: { 
      label: (
        <div className="p-2">
          <div className="font-bold text-sm mb-1">dim_customer</div>
          <div className="text-xs space-y-0.5">
            <div>🔑 customer_id (PK)</div>
            <div>customer_name</div>
            <div>email</div>
            <div>segment</div>
          </div>
        </div>
      )
    },
    style: {
      background: 'hsl(var(--secondary))',
      color: 'hsl(var(--secondary-foreground))',
      border: '2px solid hsl(var(--secondary))',
      borderRadius: '8px',
      padding: '10px',
      width: 160,
    },
  },
  {
    id: 'dim_date',
    type: 'default',
    position: { x: 700, y: 400 },
    data: { 
      label: (
        <div className="p-2">
          <div className="font-bold text-sm mb-1">dim_date</div>
          <div className="text-xs space-y-0.5">
            <div>🔑 date_id (PK)</div>
            <div>full_date</div>
            <div>year</div>
            <div>quarter</div>
            <div>month</div>
          </div>
        </div>
      )
    },
    style: {
      background: 'hsl(var(--secondary))',
      color: 'hsl(var(--secondary-foreground))',
      border: '2px solid hsl(var(--secondary))',
      borderRadius: '8px',
      padding: '10px',
      width: 140,
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e-campaign-fact',
    source: 'dim_campaign',
    target: 'fact',
    animated: true,
    style: { stroke: 'hsl(var(--primary))' },
  },
  {
    id: 'e-product-fact',
    source: 'dim_product',
    target: 'fact',
    animated: true,
    style: { stroke: 'hsl(var(--primary))' },
  },
  {
    id: 'e-customer-fact',
    source: 'dim_customer',
    target: 'fact',
    animated: true,
    style: { stroke: 'hsl(var(--primary))' },
  },
  {
    id: 'e-date-fact',
    source: 'dim_date',
    target: 'fact',
    animated: true,
    style: { stroke: 'hsl(var(--primary))' },
  },
];

export default function DataModelDiagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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
