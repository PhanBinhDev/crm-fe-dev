import React from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const data = [
  { period: 'Tuần 1', completed: 8 },
  { period: 'Tuần 2', completed: 12 },
  { period: 'Tuần 3', completed: 5 },
  { period: 'Tuần 4', completed: 15 },
];

export const Chart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height={210}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="completed" barSize={40} fill="#1890ff" name="Hoàn thành" />
        <Line type="monotone" dataKey="completed" stroke="#ff7300" name="Xu hướng" />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
