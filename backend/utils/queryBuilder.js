export class QueryBuilder {

    constructor(tabla) {
        this.tabla = tabla;
        this.selects = ["*"];
        this.joins = [];
        this.wheres = [];
        this.params = [];
        this.order = "";
        this.limitValue = "";
        this.offsetValue = "";
    }

    select(cols = ["*"]) {
    this.selects = Array.isArray(cols) ? cols : [cols];
    return this;
}

    join(type, table, condition) {
        this.joins.push(`${type} JOIN ${table} ON ${condition}`);
        return this;
    }

    where(col, value, op = "=") {
    if (value === undefined) return this;

    this.params.push(value);
    this.wheres.push(`${col} ${op} $${this.params.length}`);
    return this;
}

    orderBy(col, dir = "ASC") {
        this.order = `ORDER BY ${col} ${dir}`
        return this;
    }

    limit(n) {
        this.limitValue = `LIMIT ${n}`;
        return this;
    }

    offset(n) {
        this.offsetValue = `OFFSET ${n}`;
        return this;
    }

    build() {

        let query = `SELECT ${this.selects.join(", ")} FROM ${this.tabla}`;
        if (this.joins.length) query += " " + this.joins.join(" ");
        if (this.wheres.length) query += " WHERE " + this.wheres.join(" AND ");
        if (this.order) query += " " + this.order;
        if (this.limitValue) query += " " + this.limitValue;
        if (this.offsetValue) query += " " + this.offsetValue

        return { query, params: this.params };
    }

}