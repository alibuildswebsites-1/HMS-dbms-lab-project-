import React, { useCallback } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  Node, 
  Edge,
  Handle,
  Position,
  NodeProps,
  BackgroundVariant
} from 'reactflow';
// import 'reactflow/dist/style.css'; // REMOVED: Loaded via index.html to prevent import errors
import { Layout } from '../components/Layout';
import { Info } from 'lucide-react';

// --- Custom Node Component ---
const TableNode = ({ data }: NodeProps) => {
  return (
    <div className="bg-white rounded-lg shadow-xl border-2 border-gray-100 w-64 overflow-hidden font-mono text-sm group hover:border-[#4A7C59] transition-colors duration-300">
      <Handle type="target" position={Position.Top} className="!bg-[#4A7C59] !w-3 !h-3" />
      
      {/* Header */}
      <div className="bg-[#01411C] p-3 border-b border-[#01411C]">
        <h3 className="font-bold text-white text-center tracking-wide">{data.label}</h3>
      </div>
      
      {/* Body */}
      <div className="p-0 divide-y divide-gray-100">
        {data.columns.map((col: any, idx: number) => (
          <div key={idx} className="flex justify-between items-center px-3 py-2 hover:bg-gray-50">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-xs w-4 flex-shrink-0">
                {col.isPk && '🔑'}
                {col.isFk && '🔗'}
              </span>
              <span className={`truncate ${col.isPk ? 'font-bold text-gray-900' : col.isFk ? 'italic text-[#4A7C59]' : 'text-gray-700'}`}>
                {col.name}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 uppercase ml-2 flex-shrink-0">{col.type}</span>
          </div>
        ))}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!bg-[#4A7C59] !w-3 !h-3" />
    </div>
  );
};

const nodeTypes = {
  table: TableNode,
};

// --- Schema Definition ---

const initialNodes: Node[] = [
  // Top Row
  {
    id: 'customers',
    type: 'table',
    position: { x: 100, y: 50 },
    data: {
      label: 'Customers',
      columns: [
        { name: 'customer_id', type: 'INT', isPk: true },
        { name: 'customer_name', type: 'VARCHAR(50)' },
        { name: 'email', type: 'VARCHAR(100)' },
        { name: 'phone', type: 'VARCHAR(15)' },
        { name: 'address', type: 'TEXT' },
        { name: 'nationality', type: 'VARCHAR(50)' },
        { name: 'id', type: 'VARCHAR(50)' },
      ],
    },
  },
  {
    id: 'department',
    type: 'table',
    position: { x: 600, y: 50 },
    data: {
      label: 'Department',
      columns: [
        { name: 'department_id', type: 'INT', isPk: true },
        { name: 'department_name', type: 'VARCHAR(50)' },
        { name: 'department_head', type: 'VARCHAR(50)' },
        { name: 'contact_number', type: 'VARCHAR(15)' },
      ],
    },
  },
  // Middle Row
  {
    id: 'room',
    type: 'table',
    position: { x: 100, y: 450 },
    data: {
      label: 'Room',
      columns: [
        { name: 'room_id', type: 'INT', isPk: true },
        { name: 'room_number', type: 'VARCHAR(10)' },
        { name: 'room_type', type: 'VARCHAR(50)' },
        { name: 'floor_number', type: 'INT' },
        { name: 'price_per_night', type: 'DECIMAL' },
        { name: 'room_status', type: 'VARCHAR(20)' },
      ],
    },
  },
  {
    id: 'employee',
    type: 'table',
    position: { x: 600, y: 450 },
    data: {
      label: 'Employee',
      columns: [
        { name: 'employee_id', type: 'INT', isPk: true },
        { name: 'employee_name', type: 'VARCHAR(50)' },
        { name: 'department_id', type: 'INT', isFk: true },
        { name: 'email', type: 'VARCHAR(100)' },
        { name: 'phone', type: 'VARCHAR(15)' },
        { name: 'position', type: 'VARCHAR(50)' },
        { name: 'salary', type: 'DECIMAL' },
        { name: 'hire_date', type: 'DATE' },
        { name: 'employee_status', type: 'VARCHAR(20)' },
      ],
    },
  },
  // Bottom Row
  {
    id: 'booking',
    type: 'table',
    position: { x: 350, y: 750 },
    data: {
      label: 'Booking',
      columns: [
        { name: 'booking_id', type: 'INT', isPk: true },
        { name: 'customer_id', type: 'INT', isFk: true },
        { name: 'room_id', type: 'INT', isFk: true },
        { name: 'booking_date', type: 'DATE' },
        { name: 'check_in_date', type: 'DATETIME' },
        { name: 'check_out_date', type: 'DATETIME' },
        { name: 'number_of_guests', type: 'INT' },
        { name: 'total_amount', type: 'DECIMAL' },
        { name: 'booking_status', type: 'VARCHAR(20)' },
      ],
    },
  },
  {
    id: 'payment',
    type: 'table',
    position: { x: 350, y: 1200 },
    data: {
      label: 'Payment',
      columns: [
        { name: 'payment_id', type: 'INT', isPk: true },
        { name: 'booking_id', type: 'INT', isFk: true },
        { name: 'payment_date', type: 'DATE' },
        { name: 'amount', type: 'DECIMAL' },
        { name: 'payment_status', type: 'VARCHAR(20)' },
      ],
    },
  },
];

const initialEdges: Edge[] = [
  { 
    id: 'e-cust-book', 
    source: 'customers', 
    target: 'booking', 
    label: '1 : M', 
    animated: true, 
    style: { stroke: '#4A7C59', strokeWidth: 2 },
    labelStyle: { fill: '#4A7C59', fontWeight: 700 }
  },
  { 
    id: 'e-room-book', 
    source: 'room', 
    target: 'booking', 
    label: '1 : M', 
    animated: true,
    style: { stroke: '#4A7C59', strokeWidth: 2 },
    labelStyle: { fill: '#4A7C59', fontWeight: 700 }
  },
  { 
    id: 'e-dept-emp', 
    source: 'department', 
    target: 'employee', 
    label: '1 : M', 
    animated: true,
    style: { stroke: '#4A7C59', strokeWidth: 2 },
    labelStyle: { fill: '#4A7C59', fontWeight: 700 }
  },
  { 
    id: 'e-book-pay', 
    source: 'booking', 
    target: 'payment', 
    label: '1 : 1', 
    animated: true,
    style: { stroke: '#4A7C59', strokeWidth: 2 },
    labelStyle: { fill: '#4A7C59', fontWeight: 700 }
  },
];

export const ERDiagram: React.FC = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <Layout title="ER Diagram">
      <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
        
        {/* Info Banner */}
        <div className="bg-[#E6F4EA] border border-[#4A7C59]/20 p-4 rounded-xl flex items-center gap-3 text-[#2C4A3B] animate-in fade-in slide-in-from-top-4">
          <Info size={24} className="flex-shrink-0 text-[#4A7C59]" />
          <div>
            <h3 className="font-bold text-sm">Interactive Schema Visualization</h3>
            <p className="text-xs text-[#4A7C59] mt-0.5">
              Drag nodes to rearrange. Use scroll to zoom. This diagram represents the live database structure and relationships.
            </p>
          </div>
        </div>

        {/* Diagram Canvas */}
        <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 shadow-inner overflow-hidden relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            attributionPosition="bottom-left"
          >
            <Controls className="!bg-white !shadow-lg !border-gray-100 !rounded-lg overflow-hidden [&>button]:!border-gray-100 [&>button:hover]:!bg-gray-50" />
            <MiniMap 
              nodeStrokeColor="#01411C"
              nodeColor="#E6F4EA"
              maskColor="rgba(240, 240, 240, 0.7)"
              className="!bg-white !border !border-gray-200 !rounded-lg !shadow-md"
            />
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#cbd5e1" />
          </ReactFlow>
        </div>
      </div>
    </Layout>
  );
};