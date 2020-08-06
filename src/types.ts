export interface GeneratorList {
  name: string;
  items: string[];
  defaultCount: number;
}
export interface GeneratorData {
  lists: GeneratorList[];
  template: string;
}
