class Candidate {
  name: string;
  id: number | undefined;

  constructor(name: string) {
    this.name = name;
  }

  setId(id: number) {
    this.id = id;
  }
}

export default Candidate;
