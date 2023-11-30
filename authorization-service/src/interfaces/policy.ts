export enum PolicyEffect {
  Allow = 'Allow',
  Deny = 'Deny'
}

export interface ParsedToken {
  login: string;
  password: string;
}
