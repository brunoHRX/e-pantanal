// lib/patient-data.ts
export interface NavItem {
  title: string;
  url: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const data = {
  navMain: [
    {
      title: "Módulos",
      items: [
        { title: "Inicio",  url: "/home" },
        { title: "Pacientes",    url: "/pacientes" },
        { title: "Triagem",      url: "/triagem" },
        { title: "Atendimento",  url: "/atendimento" },
        { title: "Fila de Espera", url: "/fila-espera" },
        { title: "Farmácia",     url: "/farmacia" },
        { title: "Histórico",    url: "/historico" },
        { title: "Relatórios",    url: "/relatorios" },
        { title: "Configurações",     url: "/configuracoes" },
      ],
    },
  ] as NavSection[],
};
