"use client";
import { Calendar, Music, Loader2, Trash } from "lucide-react";
import { Header } from "./components/Header";
import { Loading } from "./components/Loading";
import { useMasses } from "./contexts/MassesContext";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function HomePage() {
    const { masses, loading, removeMass, refetch, canEditMass } = useMasses();
    const auth = useAuth();
    const user = auth?.user;
    
    useEffect(() => {
        refetch();
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="container mx-auto max-w-7xl">
                <Header />
                
                {masses.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-gray-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                            <Music className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Nenhuma missa encontrada</h3>
                        <p className="text-gray-400">Crie sua primeira missa para começar</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {masses.map((mass) => (
                            <div
                                key={mass.id}
                                className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-6 hover:border-gray-600 transition duration-200 group"
                            >
                                <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-blue-400 transition duration-200">
                                    {mass.title}
                                </h3>
                                
                                <div className="flex items-center gap-2 text-gray-400 mb-3">
                                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                                        <Calendar size={16} />
                                    </div>
                                    <span className="text-sm font-medium">
                                        {new Date(mass.mass_date).toLocaleDateString("pt-BR")}
                                    </span>
                                </div>
                                
                                {mass.description && (
                                    <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                                        {mass.description}
                                    </p>
                                )}
                                
                                <div className="flex flex-wrap gap-2">
                                    {canEditMass(mass) && (
                                        <a
                                            href={`/mass/${mass.id}/edit`}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition duration-200 hover:scale-105 active:scale-95"
                                        >
                                            Editar
                                        </a>
                                    )}
                                    <a
                                        href={`/mass/${mass.id}/present`}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition duration-200 hover:scale-105 active:scale-95"
                                    >
                                        <Music size={14} />
                                        Apresentar
                                    </a>
                                    <button
                                        onClick={() => removeMass(mass.id)}
                                        type="button"
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition duration-200 hover:scale-105 active:scale-95"
                                    >
                                        <Trash size={14} /> 
                                        Remover
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}