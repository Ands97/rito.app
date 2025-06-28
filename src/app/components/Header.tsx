import { Plus } from "lucide-react";
import { useState } from "react";
import CreateMassModal from "./CreateMassModal";
import { useAuth } from "../../context/AuthContext";

export const Header = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const auth = useAuth();
    const user = auth?.user;
    return (
        <header className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-6 mb-8">
            <div className="flex flex-col md:flex-row md:justify-between justify-center items-center">
                <a href="/" className="flex items-center group">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center group-hover:bg-gray-600 transition duration-200">
                            <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
                        </div>
                        <h1 className="text-3xl font-bold text-white group-hover:text-blue-400 transition duration-200">Rito.app</h1>
                    </div>
                </a>
                <div className="flex gap-4 items-center mt-4 md:mt-0">
                    {user ? (
                        <>
                            <div className="text-right">
                                <div className="text-gray-300 text-sm font-medium">
                                    {user.nome || 'Usuário'}
                                </div>
                                <div className="text-gray-500 text-xs">
                                    {user.company_name}
                                </div>
                            </div>
                            <div className="flex gap-4 items-center">
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition duration-200 hover:scale-105 active:scale-95 shadow-lg"
                                >
                                    <Plus size={20} />
                                    Nova Missa
                                </button>
                                <button
                                    onClick={() => auth?.signOut()}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold transition duration-200 hover:scale-105 active:scale-95 shadow-lg"
                                >
                                    Sair
                                </button>
                            </div>
                        </>
                    ) : (
                        <a
                            href="/login"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold transition duration-200 hover:scale-105 active:scale-95 shadow-lg"
                        >
                            Entrar
                        </a>
                    )}
                </div>
            </div>

            {showCreateModal && (
                <CreateMassModal onClose={() => setShowCreateModal(false)} />
            )}
        </header>
    );
};