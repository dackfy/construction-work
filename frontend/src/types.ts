export type WorkType = {
  id: string;
  name: string;
};

export type WorkLog = {
  id: string;
  performedAt: string;
  volume: number;
  unit: string;
  performerName: string;
  comment: string;
  workType: WorkType;
};

export type WorkLogInput = {
  performedAt: string;
  workTypeId: string;
  volume: string;
  unit: string;
  performerName: string;
  comment: string;
};
