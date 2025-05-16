import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Button, Input, Label, Message } from "../components/UI";

const AddInmueblePage = () => {

    return (
        <div className="p-6">
            <Card>
                <h1 className="text-2xl font-bold mb-4">Agregar Inmueble</h1>
                <form>
                    <div className="mb-4">
                        <Label htmlFor="nombreusuario"> Nombre: </Label>

                        <Input
                            type="text"
                            name="nombreusuario"
                            placeholder="Escribe el nombre"
                            autoFocus
                        />

                    </div>
                    <Button> Agregar Inmueble </Button>
                </form>
            </Card>
        </div>
    );
};

export default AddInmueblePage;