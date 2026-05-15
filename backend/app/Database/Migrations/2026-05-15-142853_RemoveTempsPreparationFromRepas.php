<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class RemoveTempsPreparationFromRepas extends Migration
{
    public function up()
    {
        // Supprime uniquement la colonne sans toucher aux données
        $this->forge->dropColumn('repas', 'temps_preparation');
    }

    public function down()
    {
        // En cas de retour en arrière, on recrée la colonne
        $this->forge->addColumn('repas', [
            'temps_preparation' => ['type' => 'INT', 'default' => 0]
        ]);
    }
}