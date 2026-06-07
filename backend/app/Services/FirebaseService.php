<?php

namespace App\Services;

use Kreait\Firebase\Factory;

class FirebaseService
{
    protected $database;

    public function __construct()
    {
        $factory = (new Factory)
            ->withServiceAccount(base_path(env('FIREBASE_CREDENTIALS')))
            ->withDatabaseUri(env('FIREBASE_DATABASE_URL'));

        $this->database = $factory->createDatabase();
    }

    public function createDocument(string $collection, array $data)
    {
        $reference = $this->database
            ->getReference($collection)
            ->push();

        $data['id'] = $reference->getKey();

        $reference->set($data);

        return $data;
    }

    public function getDocuments(string $collection)
    {
        $snapshot = $this->database
            ->getReference($collection)
            ->getSnapshot();

        $data = $snapshot->getValue();

        if (!$data) {
            return [];
        }

        return array_values($data);
    }

    public function getDocument(string $collection, string $id)
    {
        $snapshot = $this->database
            ->getReference($collection . '/' . $id)
            ->getSnapshot();

        return $snapshot->getValue();
    }

    public function updateDocument(string $collection, string $id, array $data)
    {
        $this->database
            ->getReference($collection . '/' . $id)
            ->update($data);

        return $this->getDocument($collection, $id);
    }

    public function deleteDocument(string $collection, string $id)
    {
        $this->database
            ->getReference($collection . '/' . $id)
            ->remove();

        return true;
    }
}