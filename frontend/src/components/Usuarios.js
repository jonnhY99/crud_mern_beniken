// src/components/Usuarios.js
import React, { useState, useEffect } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getFrequentUsers,
} from "../utils/api";
import { useToast } from "../context/ToastContext";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [frecuentes, setFrecuentes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "cliente",
    password: "",
    isFrequent: false,
  });
  const { addToast } = useToast();

  // 🔹 Función para cargar usuarios frecuentes
  const fetchFrequentUsers = async () => {
    try {
      const data = await getFrequentUsers();
      // El backend retorna { success: true, users: [...] }
      setFrecuentes(Array.isArray(data) ? data : (data?.users || []));
    } catch {
      addToast("Error cargando frecuentes", "error");
      setFrecuentes([]); // Fallback seguro
    }
  };

  // 🔹 Cargar usuarios normales al montar
  useEffect(() => {
    getUsers()
      .then((data) => {
        // Validación defensiva para usuarios normales también
        setUsuarios(Array.isArray(data) ? data : (data?.users || []));
      })
      .catch(() => {
        addToast("Error cargando usuarios", "error");
        setUsuarios([]); // Fallback seguro
      });
  }, []);

  // 🔹 Cargar usuarios frecuentes al montar
  useEffect(() => {
    fetchFrequentUsers();

    // Escuchar el evento global desde CustomerForm
    const handleUpdate = () => {
      fetchFrequentUsers();
    };
    window.addEventListener("userFrequentUpdated", handleUpdate);

    // Limpiar al desmontar
    return () => {
      window.removeEventListener("userFrequentUpdated", handleUpdate);
    };
  }, []);

  const handleEditar = (usuario) => {
    setEditUser(usuario);
    setFormData({
      name: usuario.name,
      email: usuario.email,
      role: usuario.role,
      password: "",
      isFrequent: usuario.isFrequent || false,
    });
    setIsModalOpen(true);
  };

  const handleCrear = () => {
    setEditUser(null);
    setFormData({
      name: "",
      email: "",
      role: "cliente",
      password: "",
      isFrequent: false,
    });
    setIsModalOpen(true);
  };

  const handleGuardar = async () => {
    try {
      if (editUser) {
        const actualizado = await updateUser(editUser._id, formData);
        setUsuarios(
          usuarios.map((u) => (u._id === editUser._id ? actualizado : u))
        );

        // refrescar tabla de frecuentes
        await fetchFrequentUsers();

        addToast("Usuario actualizado correctamente");
      } else {
        const nuevo = await createUser(formData);
        setUsuarios([...usuarios, nuevo]);
        if (nuevo.isFrequent) {
          setFrecuentes([...frecuentes, nuevo]);
        }
        addToast("Usuario creado correctamente");
      }
      setIsModalOpen(false);
      setEditUser(null);
    } catch {
      addToast("Error al guardar usuario", "error");
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este usuario?")) {
      try {
        await deleteUser(id);
        setUsuarios(usuarios.filter((u) => u._id !== id));
        setFrecuentes(frecuentes.filter((u) => u._id !== id));
        addToast("Usuario eliminado correctamente");
      } catch {
        addToast("Error al eliminar usuario", "error");
      }
    }
  };

  return (
    <div className="p-3 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Gestión de Usuarios</h2>

      {/* Botón Crear Usuario */}
      <button
        onClick={handleCrear}
        className="mb-4 px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm sm:text-base touch-manipulation"
      >
        Crear Usuario
      </button>

      {/* Tabla Usuarios */}
      <h3 className="text-lg sm:text-xl font-bold mb-2">Todos los Usuarios</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow text-xs sm:text-sm">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="py-1 sm:py-2 px-2 sm:px-4 border-b">Nombre</th>
              <th className="py-1 sm:py-2 px-2 sm:px-4 border-b hidden sm:table-cell">Email</th>
              <th className="py-1 sm:py-2 px-2 sm:px-4 border-b">Rol</th>
              <th className="py-1 sm:py-2 px-2 sm:px-4 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(usuarios || []).map((usuario) => (
              <tr key={usuario._id} className="hover:bg-gray-100">
                <td className="py-1 sm:py-2 px-2 sm:px-4 border-b truncate max-w-24 sm:max-w-none">{usuario.name}</td>
                <td className="py-1 sm:py-2 px-2 sm:px-4 border-b hidden sm:table-cell truncate">{usuario.email}</td>
                <td className="py-1 sm:py-2 px-2 sm:px-4 border-b">{usuario.role}</td>
                <td className="py-1 sm:py-2 px-2 sm:px-4 border-b">
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                    <button
                      onClick={() => handleEditar(usuario)}
                      className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs sm:text-sm touch-manipulation"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(usuario._id)}
                      className="px-2 sm:px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs sm:text-sm touch-manipulation"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tabla Usuarios Frecuentes */}
      <h3 className="text-lg sm:text-xl font-bold mt-6 mb-2">Usuarios Frecuentes</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow text-xs sm:text-sm">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="py-1 sm:py-2 px-2 sm:px-4 border-b">Nombre</th>
              <th className="py-1 sm:py-2 px-2 sm:px-4 border-b hidden sm:table-cell">Email</th>
              <th className="py-1 sm:py-2 px-2 sm:px-4 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(frecuentes || []).map((usuario) => (
              <tr key={usuario._id} className="hover:bg-gray-100">
                <td className="py-1 sm:py-2 px-2 sm:px-4 border-b truncate max-w-24 sm:max-w-none">{usuario.name}</td>
                <td className="py-1 sm:py-2 px-2 sm:px-4 border-b hidden sm:table-cell truncate">{usuario.email}</td>
                <td className="py-1 sm:py-2 px-2 sm:px-4 border-b">
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                    <button
                      onClick={() => handleEditar(usuario)}
                      className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs sm:text-sm touch-manipulation"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(usuario._id)}
                      className="px-2 sm:px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs sm:text-sm touch-manipulation"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Crear/Editar - Mobile Responsive */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md sm:w-96">
            <h3 className="text-xl font-bold mb-4">
              {editUser ? "Editar Usuario" : "Crear Usuario"}
            </h3>

            <label className="block mb-2">
              Nombre:
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
            </label>

            <label className="block mb-2">
              Email:
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
            </label>

            <label className="block mb-2">
              Rol:
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full p-2 border rounded"
              >
                <option value="admin">Admin</option>
                <option value="carniceria">Carnicería</option>
                <option value="cliente">Cliente</option>
              </select>
            </label>

            <label className="block mb-2">
              Usuario Frecuente:
              <input
                type="checkbox"
                checked={formData.isFrequent}
                onChange={(e) =>
                  setFormData({ ...formData, isFrequent: e.target.checked })
                }
                className="ml-2"
              />
            </label>

            <label className="block mb-2">
              Contraseña {editUser ? "(dejar vacío para no cambiar)" : ""}:
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
            </label>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
