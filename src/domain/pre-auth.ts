export class InvoiceItem {
  tech      : string;
  unitNumber: number;
  wONumber  : number;
  hours     : number;
  amount    : number;
  glCategory: string;
  percent   : number;
};

export class PreAuth {
  public title      : string;
  public date       : string;
  public companyName: string;
  public note       : string;
  public authNumber : number;

  public vendorInformation:{
    vendorCode    : number;
    vendorName    : string;
    vendorPhone   : number;
    vendorEmail   : string;
    contractNumber: number;
    paymentTerms  : string;
    totalAmount   : number;
    vendorAddress : {
      street  : string;
      city    : string;
      state   : string;
      zipcode : number;
      country : string;
    };
  };

  public contactInformation:{
    requestorName  : string;
    email          : string;
    telephoneNumber: string;
  };

  public ShipToInformation:{
    plantName   : string;
    deliveryDate: string;
    address     :{
      street : string;
      city   : string;
      state  : string;
      zip    : number;
      country: string;
    };
  };

  public invoicesubmission:{
    sendInvoiceAsPdfToEmail: string;
    orSendToAddress        : {
      recipient: string;
      street01 : string;
      street02 : string;
      city     : string;
      state    : string;
      zipcode  : number;
      country  : string;
    };
  };

  public invoiceData: Array<InvoiceItem>
}
