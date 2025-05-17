// src/app/patients/newPatient/page.tsx
import React, { Suspense } from 'react';
import NewPatientForm from './NewPatientForm';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando formulário…</div>}>
      <NewPatientForm />
    </Suspense>
  );
}