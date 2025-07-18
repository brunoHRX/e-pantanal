import { OdontogramaQuadrante } from './OdontogramaQuadrante'

export default function OdontogramaBoca() {
  return (
    <div className="inline-block bg-white rounded px-4 py-3 border">
      {/* Linha Superior */}
      <div className="flex flex-row items-end relative">
        {/* Quadrante Superior Direito */}
        <OdontogramaQuadrante
          numeros={[18, 17, 16, 15, 14, 13, 12, 11]}
          titulo=""
        />
        {/* Separador vertical */}
        <div className="h-24 border-r-2 border-dashed border-gray-400 mx-2"></div>
        {/* Quadrante Superior Esquerdo */}
        <OdontogramaQuadrante
          numeros={[21, 22, 23, 24, 25, 26, 27, 28]}
          titulo=""
        />
      </div>
      {/* Separador horizontal central */}
      <div className="flex justify-center">
        <div
          className="w-full border-t-2 border-dashed border-gray-400 my-2"
          style={{ maxWidth: 520 }}
        ></div>
      </div>
      {/* Linha Inferior */}
      <div className="flex flex-row items-start relative">
        {/* Quadrante Inferior Direito */}
        <OdontogramaQuadrante
          numeros={[48, 47, 46, 45, 44, 43, 42, 41]}
          titulo=""
        />
        {/* Separador vertical */}
        <div className="h-24 border-r-2 border-dashed border-gray-400 mx-2"></div>
        {/* Quadrante Inferior Esquerdo */}
        <OdontogramaQuadrante
          numeros={[31, 32, 33, 34, 35, 36, 37, 38]}
          titulo=""
        />
      </div>
    </div>
  )
}
