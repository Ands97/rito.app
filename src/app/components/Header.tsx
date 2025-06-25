import { Plus } from "lucide-react";
import { useState } from "react";
import CreateMassModal from "./CreateMassModal";

export const Header = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    return (
        <header className="header">
            <div className="flex flex-col md:flex-row md:justify-between justify-center items-center mb-8">
                <a href="/" className="flex items-center">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="h-24" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Rito.app</h1>
                </a>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={20} />
                    Nova Missa
                </button>
            </div>

            {showCreateModal && (
                <CreateMassModal onClose={() => setShowCreateModal(false)} />
            )}
        </header>
    );
};
