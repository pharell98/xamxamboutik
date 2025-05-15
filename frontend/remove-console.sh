#!/bin/bash
# Ce script parcourt tous les fichiers .js et .jsx (en excluant node_modules)
# et supprime les appels à console.log, même s'ils s'étendent sur plusieurs lignes.

# La commande Perl ci-dessous lit le fichier en entier (-0777) et remplace tout
# bloc correspondant à "console.log(...);" par rien.
# Le modificateur /s permet au . de capturer également les sauts de ligne.
PERL_CMD='perl -0777 -pi -e "s/console\.log\(.*?\);\s*//gs"'

# Parcourir tous les fichiers .js et .jsx en excluant node_modules
find . -type d -name node_modules -prune -o -type f \( -name "*.js" -o -name "*.jsx" \) -print0 | while IFS= read -r -d '' file; do
    echo "Traitement du fichier : $file"
    # Exécute la commande Perl sur le fichier
    eval "$PERL_CMD \"$file\""
done

echo "Suppression des console.log terminée."
