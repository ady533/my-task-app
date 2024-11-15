
export interface Task {
  id: string;
  text: string;
  checked: boolean;
}

export interface TaskList {
  tasks: Task[];
}

export interface Lists {
  [key: string]: TaskList;
}
