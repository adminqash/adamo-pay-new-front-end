const SPANISH_CHARS = /[áéíóúñ¿¡]/i;

const SPANISH_WORDS =
  /\b(el|la|los|las|un|una|unos|unas|de|del|que|con|para|por|se|más|sin|añadir|agregar|arreglar|corregir|actualizar|eliminar|borrar|cambiar|mejorar|soluciona|arregla|corrige|actualiza|elimina|añade|agrega|cambia|mejora)\b/i;

const englishOnly = {
  rules: {
    "subject-english-only": ({ subject }) => {
      const hasSpanish = SPANISH_CHARS.test(subject) || SPANISH_WORDS.test(subject);

      return [!hasSpanish, "commit subject must be written in English"];
    },
  },
};

export default {
  extends: ["@commitlint/config-conventional"],
  plugins: [englishOnly],
  rules: {
    "subject-case": [2, "always", "lower-case"],
    "subject-full-stop": [2, "never", "."],
    "subject-english-only": [2, "always"],
  },
};
