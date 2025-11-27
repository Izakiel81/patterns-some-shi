const DataTable = (data, props) => {
  return (
    <tr {...props}>
      <td>{data.id}</td>
      <td>{data.name}</td>
      <td>{data.email}</td>
      <td>{data.getRole()}</td>
    </tr>
  );
};

export default DataTable;
