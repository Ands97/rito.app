export const chordTransposer = (chords: string, fromKey: string, toKey: string): string => {
  // Lista de notas e suas posições
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Função para encontrar a posição de uma nota na escala
  const getNoteIndex = (note: string) => {
    return notes.indexOf(note);
  };

  // Função para transpor uma nota
  const transposeNote = (note: string, semitones: number): string => {
    const index = getNoteIndex(note);
    if (index === -1) return note; // Retorna a nota original se não for encontrada
    const newIndex = (index + semitones + 12) % 12; // +12 para evitar números negativos
    return notes[newIndex];
  };

  // Função para transpor um acorde
  const transposeChord = (chord: string, semitones: number): string => {
    // Extrai a nota base e o resto do acorde
    const match = chord.match(/([A-G]#?)(.*)/);
    if (!match) return chord;

    const baseNote = match[1];
    const chordType = match[2];
    const newBaseNote = transposeNote(baseNote, semitones);

    return `${newBaseNote}${chordType}`;
  };

  // Calcula o número de semitons para transposição
  const fromKeyIndex = getNoteIndex(fromKey);
  const toKeyIndex = getNoteIndex(toKey);
  if (fromKeyIndex === -1 || toKeyIndex === -1) return chords;

  const semitones = (toKeyIndex - fromKeyIndex + 12) % 12;

  // Transpõe cada acorde
  const lines = chords.split('\n');
  const transposedLines = lines.map(line => {
    const words = line.split(' ');
    const transposedWords = words.map(word => {
      // Verifica se é um acorde (contém uma nota válida)
      const match = word.match(/([A-G]#?)/);
      if (match && getNoteIndex(match[1]) !== -1) {
        return transposeChord(word, semitones);
      }
      return word;
    });
    return transposedWords.join(' ');
  });

  return transposedLines.join('\n');
};
