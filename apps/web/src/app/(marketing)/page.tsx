import Antesala from '@/features/landing/antesala/Antesala';
import ColaEjemplo from '@/features/landing/secciones/ColaEjemplo';
import ComoFunciona from '@/features/landing/secciones/ComoFunciona';
import Hero from '@/features/landing/secciones/Hero';
import Pie from '@/features/landing/secciones/Pie';
import Principio from '@/features/landing/secciones/Principio';

export default function Page() {
  return (
    <Antesala>
      <main>
        <Hero />
        <ComoFunciona />
        <ColaEjemplo />
        <Principio />
      </main>
      <Pie />
    </Antesala>
  );
}
