/* eslint-disable react/prop-types */
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer } from '../ChartContainer';

export const GeographyCharts = ({ data }) => (
  <>
    <ChartContainer title="Top Counties">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.byCounty.slice(0, 5)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="county" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>

    <ChartContainer title="Top Cities">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.byCity.slice(0, 5)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="city" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  </>
);