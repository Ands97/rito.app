"use client";

import { useState } from "react";
import { X, Youtube, ExternalLink, Upload, Type } from "lucide-react";
import { supabase } from "@/lib/supabase";
import PDFUploader from "./PDFUploader";

interface Props {
    categoryId?: string;
    onSongCreated: (songId: string) => void;
    onClose: () => void;
}

export default function CreateSongModal({
    categoryId,
    onSongCreated,
    onClose,
}: Props) {
    const [formData, setFormData] = useState({
        title: "",
        artist: "",
        lyrics: "",
        chords: "",
        audio_url: "",
        youtube_url: "",
        cifraclub_url: "",
        category_id: categoryId || "",
        tonality: "C", // valor padrão
    });
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase
                .from("songs")
                .insert([formData])
                .select()
                .single();

            if (error) throw error;
            onSongCreated(data.id);
        } catch (error) {
            console.error("Error creating song:", error);
        }
    };

    const importFromCifraClub = async () => {
        if (!formData.cifraclub_url) return;

        setImporting(true);
        try {
            const response = await fetch("/api/scraping/cifraclub", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: formData.cifraclub_url }),
            });

            const data = await response.json();
            setFormData((prev) => ({
                ...prev,
                title: data.title || prev.title,
                artist: data.artist || prev.artist,
                chords: data.chords || prev.chords,
                lyrics: data.lyrics || prev.lyrics,
            }));
        } catch (error) {
            console.error("Error importing from CifraClub:", error);
        } finally {
            setImporting(false);
        }
    };

    const extractYouTubeId = (url: string) => {
        const match = url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
        );
        return match ? match[1] : null;
    };

    const onSongImported = (data: any) => {
        setFormData((prev) => ({
            ...prev,
            title: data.title || prev.title,
            artist: data.artist || prev.artist,
            chords: data.chords || prev.chords,
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6">
                    <h2 className="text-xl font-semibold text-white">
                        Criar Nova Música
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition duration-200 group"
                    >
                        <X
                            size={18}
                            className="text-gray-400 group-hover:text-white"
                        />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-900/20 border border-red-700 rounded-xl p-3">
                            <div className="flex items-center">
                                <svg
                                    className="w-5 h-5 text-red-400 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span className="text-red-400 text-sm">
                                    {error}
                                </span>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Título *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                                className="block w-full pl-3 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Artista
                            </label>
                            <input
                                type="text"
                                value={formData.artist}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        artist: e.target.value,
                                    })
                                }
                                className="block w-full pl-3 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Tonalidade
                        </label>
                        <select
                            value={formData.tonality}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    tonality: e.target.value,
                                })
                            }
                            className="block w-full pl-3 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        >
                            <option value="C">C</option>
                            <option value="C#">C#</option>
                            <option value="D">D</option>
                            <option value="D#">D#</option>
                            <option value="E">E</option>
                            <option value="F">F</option>
                            <option value="F#">F#</option>
                            <option value="G">G</option>
                            <option value="G#">G#</option>
                            <option value="A">A</option>
                            <option value="A#">A#</option>
                            <option value="B">B</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-medium text-white">
                            Links Externos
                        </h3>

                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        URL do CifraClub
                                    </label>

                                    <input
                                        type="url"
                                        value={formData.cifraclub_url}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                cifraclub_url: e.target.value,
                                            })
                                        }
                                        placeholder="https://www.cifraclub.com.br/..."
                                        className="block w-full pl-3 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={importFromCifraClub}
                                    disabled={
                                        !formData.cifraclub_url || importing
                                    }
                                    className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
                                >
                                    <ExternalLink size={16} />
                                    {importing ? "Importando..." : "Importar"}
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-white">
                                    URL do YouTube
                                </label>
                                <input
                                    type="url"
                                    value={formData.youtube_url}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            youtube_url: e.target.value,
                                        })
                                    }
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="w-full pl-3 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-white">
                                    URL do Áudio
                                </label>
                                <input
                                    type="url"
                                    value={formData.audio_url}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            audio_url: e.target.value,
                                        })
                                    }
                                    placeholder="https://..."
                                    className="w-full pl-3 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-white">
                                    Upload de arquivo
                                </label>
                                <PDFUploader onSongImported={onSongImported} />
                            </div>
                        </div>
                    </div>

                    <div className="">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-white">
                                Cifras
                            </label>
                            <textarea
                                value={formData.chords}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        chords: e.target.value,
                                    })
                                }
                                rows={12}
                                className="w-full pl-3 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 font-mono text-sm"
                                placeholder="Digite as cifras..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white py-3 rounded-xl font-medium transition duration-200 hover:scale-[1.02] active:scale-[0.98]"
                            >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                            >
                            Criar Música
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
