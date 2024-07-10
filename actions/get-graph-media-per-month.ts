import prismadb from "@/lib/prismadb"

interface GraphData {
  name: string;
  total: number;
}

export const getGraphMediaPerMonth = async (): Promise<GraphData[]> => {
  const medias = await prismadb.media.findMany();

  const monthlyCreation: { [key: number]: number } = {};

  for (const media of medias) {
    const month = media.createdAt.getMonth();

    if (!monthlyCreation[month]) {
      monthlyCreation[month] = 1;
    } else {
      monthlyCreation[month]++
    }
  }

  const graphData: GraphData[] = [
    { name: 'Jan', total: 0 },
    { name: 'Fev', total: 0 },
    { name: 'Mar', total: 0 },
    { name: 'Abr', total: 0 },
    { name: 'Mai', total: 0 },
    { name: 'Jun', total: 0 },
    { name: 'Jul', total: 0 },
    { name: 'Ago', total: 0 },
    { name: 'Set', total: 0 },
    { name: 'Out', total: 0 },
    { name: 'Nov', total: 0 },
    { name: 'Dez', total: 0 },
  ];

  for (const month in monthlyCreation) {
    graphData[parseInt(month)].total = monthlyCreation[parseInt(month)];
  };

  return graphData
}