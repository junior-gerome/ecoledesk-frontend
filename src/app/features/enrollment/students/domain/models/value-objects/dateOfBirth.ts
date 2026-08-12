export class DateOfBirth{
  

  private constructor(private readonly value:Date){}

  public static create(date:Date):DateOfBirth{
    this.validate(date);
    return new DateOfBirth(date);
  }

  public getValue(): Date{
    return this.value;
  }

  private static validate(date:Date):void{
    const age = this.calculateAge(date);
    if(age < 3){
      throw new Error("un enfant doit avoir au moins 3 ans pour etre scolarise");
    }
    }

  private static calculateAge(date:Date):number{
    const today = new Date();
    let age = today.getFullYear()-date.getFullYear();

    const m = today.getMonth()-date.getMonth();

    if(m < 0 || (m === 0 && today.getDate()<date.getDate())){
      age--;
    }
    return age
  }
}