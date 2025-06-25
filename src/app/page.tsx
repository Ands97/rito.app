"use client";
import { Calendar, Music, Loader2, Trash } from "lucide-react";
import { Header } from "./components/Header";
import { Loading } from "./components/Loading";
import { useMasses } from "./contexts/MassesContext";
import { useEffect } from "react";

export default function HomePage() {
    const { masses, loading, removeMass, refetch } = useMasses();
    

    useEffect(() => {
        refetch();
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="container mx-auto p-6 text-black">
            <Header />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {masses.map((mass) => (
                    <div
                        key={mass.id}
                        className="bg-white rounded-lg shadow-md p-6"
                    >
                        <h3 className="text-xl font-semibold mb-2">
                            {mass.title}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <Calendar size={16} />
                            <span>
                                {new Date(mass.mass_date).toLocaleDateString(
                                    "pt-BR"
                                )}
                            </span>
                        </div>
                        {mass.description && (
                            <p className="text-gray-700 mb-4">
                                {mass.description}
                            </p>
                        )}
                        <div className="flex gap-2">
                            <a
                                href={`/mass/${mass.id}/edit`}
                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                            >
                                Editar
                            </a>
                            <a
                                href={`/mass/${mass.id}/present`}
                                className="bg-green-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                            >
                                <Music size={14} />
                                Apresentar
                            </a>
                            <button
                                onClick={() => removeMass(mass.id)}
                                type="button"
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                            >
                               <Trash size={14} /> 
                                Remover{" "}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
