export const handleDeleteSelected = async () => {

}

export const handleRowSelected = async (numFactura, isChecked, selectedRows, editingRows, setEditingRows, setSelectedRows) => {
    const newSelectedRows = new Set(selectedRows)
    if (isChecked) {
        newSelectedRows.add(numFactura)
    } else {
        newSelectedRows.delete(numFactura)

        const newEditingRows = new Set(editingRows)
        newEditingRows.delete(numFactura)
        setEditingRows(newEditingRows)
    }
    setSelectedRows(newSelectedRows)
}

export const handleSelectAll = (isChecked, editedRows, setSelectedRows, setEditingRows) => {
    if (isChecked) {
        const allFacturas = editedRows.map(row => row.num_factura);
        setSelectedRows(new Set(allFacturas));
    } else {
        setSelectedRows(new Set());
        setEditingRows(new Set());
    }
};