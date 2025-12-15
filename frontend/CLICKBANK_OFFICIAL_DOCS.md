Orders API
ClickBank’s Orders API guide explains how to retrieve and manage order data, including status, items, and customer details.

Updated over 8 months ago
Overview
NOTE: Using the ClickBank Orders API may require a rudimentary understanding of computer programming. If you do not feel equipped to proceed, we encourage you to seek assistance from someone who has computer programming experience.

The Orders API lets you view order information and update some order parameters.

URL

Methods

Return Types

Usage Information

Related Articles

URL
URL: https://api.clickbank.com/rest/1.3/orders2

 

Methods
This section provides details about the methods available within the Orders API, including required keys and roles, output types, and supported and required parameters.

 

The following methods are covered in this section:

GET /1.3/orders2/schema – Returns the XML schema for order data results.

GET /1.3/orders2/{receipt} – Returns order details for the given receipt number.

GET /1.3/orders2/{receipt}/upsells – Returns all upsell transactions for the given initial transaction receipt number.

GET /1.3/orders2/count – Returns the number of orders matching the specified criteria.

GET /1.3/orders2/list – Returns a list of orders matching the specified criteria.

POST /1.3/orders2/{receipt}/changeProduct – Changes a subscription from one product to another.*

POST /1.3/orders2/{receipt}/changeAddress – Changes a customer's address.

POST /1.3/orders2/{receipt}/changeDate – Changes the date of the next rebill for a recurring product.*

POST /1.3/orders2/{receipt}/extend – Extends the specified subscription by a specified number of periods.*

POST /1.3/orders2/{receipt}/pause – Pauses the specified subscription.*

POST /1.3/orders2/{receipt}/reinstate – Reinstates the specified subscription.*

HEAD /1.3/orders2/{receipt} – Provides the status of the specified subscription.

GET /1.3/orders2/schema
This method returns the XML schema for order data results.

Required Keys and Roles
None

Supported Output Types
application/xml

Return Type
XML schema for List of Order Data

 

GET /1.3/orders2/{receipt}
This method returns a list of order detail objects which match the given receipt number.

 

Request Parameters
Name

Required

Description

sku

Required for orders with multiple items

The SKU of the line item. Used to identify individual purchases in multi-item cart purchases.

 
Required Keys and Roles
ClickBank API Key

API Order Read Role

Return Type
List of Order Data

Supported Output Types
application/xml

application/json

GET /1.3/orders2/{receipt}/upsells
This method returns all upsell transactions for the given parent upsell transaction.

If the transaction does not exist, if you do not have access to the transaction, or if there are no upsells for this transaction, a status code of 403 (No Content) is returned.

 

Required Keys and Roles
ClickBank API Key

API Order Read Role

Return Type
List of Order Data

Supported Output Types
application/xml

application/json

GET /1.3/orders2/count
This method returns a count of the orders that match the specified search criteria.

Request Parameters
Name

Required

Description

affiliate

No

Return results in which the specified account nickname was the affiliate.

Supports the word 'none' to search for transactions without affiliates, and wildcard searches using the '%' character.

item

No

The item number of the order.

email

No

A customer's email address.

Supports wildcard searches using the '%' character.

lastName

No

A customer's last name.

Supports wildcard searches using the '%' character.

role

No

Your role in the transaction. Valid values are:

VENDOR

AFFILIATE

startDate

No

Return results within the specified date range.

The date range is inclusive. The date format is yyyy-mm-dd. The default date range is from yesterday to today. If you use one date parameter, you must also use the other.

endDate

tid

No

Search for transactions using the specified tracking ID or Promo Code. This includes both vendor and affiliate tracking codes. This code is returned in the promo field.

type

No

Return results for the specified type of transaction. Valid values are:

SALE

RFND

CGBK

FEE

BILL

TEST_SALE

TEST_BILL

TEST_RFND

TEST_FEE

If no type is specified, the results include all types. If you specify an invalid type, no transactions are returned.

vendor

No

Return results in which the specified account nickname was the vendor.

Supports wildcard searches using the '%' character.

 
Required Keys and Roles
ClickBank API Key

API Order Read Role

Return Type
Count of matching orders

 

GET /1.3/orders2/list
This method lists all of the orders which are visible to you and which match the specified search criteria.

 

Only the first 100 orders will be returned. This method supports pagination, so if the second page of the next 100 items is required a request header 'Page' with value 2 will return them.

 

This method returns a status code of 200 if all the receipts have been obtained, or a 206 [Partial Return] if there are more results available.

 

Head Parameters
Name

Required

Description

page

No

Return the specified page of results. The default is page 1.

 
Request Parameters
Name

Required

Description

affiliate

No

Return results in which the specified account nickname was the affiliate.

Supports the word 'none' to search for transactions without affiliates, and wildcard searches using the '%' character.

amount

No

The total transaction amount, including tax, in any currency.

email

No

A customer's email address.

Supports wildcard searches using the '%' character.

item

No

The item number of the order.

lastName

No

A customer's last name.

Supports wildcard searches using the '%' character.

postalCode

No

A customer's zip or postal code.

Supports wildcard searches using the '%' character.

role

No

Your role in the transaction. Valid values are:

VENDOR

AFFILIATE


startDate
​
​

No

Return results within the specified date range.

The date range is inclusive. The date format is yyyy-mm-dd. The default date range is from yesterday to today. If you use one date parameter, you must also use the other.

endDate

tid

No

Search for transactions using the specified tracking ID or Promo Code. This includes both vendor and affiliate tracking codes. This code is returned in the promo field.

type

No

Return results for the specified type of transaction. Valid values are:

SALE

RFND

CGBK

FEE

BILL

TEST_SALE

TEST_BILL

TEST_RFND

TEST_FEE

If no type is specified, the results include all types. If you specify an invalid type, no transactions are returned.

vendor

No

Return results in which the specified account nickname was the vendor.

Supports wildcard searches using the '%' character.

 
Required Keys and Roles
ClickBank API Key

API Order Read Role

Return Type
List of Order Data

 

Supported Output Types
application/xml

application/json

POST /1.3/orders2/{receipt}/changeProduct
This method lets you upgrade or downgrade the product associated with a subscription. An email confirmation is sent to the customer and to you.

 

There are some restrictions on the new product. If the old product was a digital product, the new product cannot be a physical product. If the old product was a physical product, the new product can be a physical product, but at a minimum it must be configured to ship to all of the locations to which you could ship the original product. Both products must use the same currency.

 

When you upgrade or downgrade a subscription, the number of remaining subscription payments is not changed.

 

When you use this method, we refund a portion of the old product's last recurring payment unless you specify otherwise. This amount is prorated based on the amount of time remaining in the subscription period.

 

NOTE – Master accounts will display the old product, rather than the new product, until the next specified billing date.

 

Request Parameters
Name

Required

Description

newSku

Yes

The SKU of the new product for the subscription.

oldSku

Yes

The SKU of the current product for the subscription.

carryAffiliate

No

Determines if the affiliate from the original transaction is carried over to the new subscription.

applyProratedRefund

No

Determines if the customer is given a prorated refund based on the difference in product prices. The default is TRUE.

nextRebillDate

No

Specifies the next billing date. The date format is yyyy-mm-dd. The default value is the next day.

 
Required Keys and Roles
ClickBank API Key

API Subscription Modification Role

API Order Write Role

Return Type
No Content

 

POST /1.3/orders2/{receipt}/changeAddress
This method lets you change the shipping address of a physical recurring subscription.

 

Request Parameters
Name

Required

Description

firstName

No

Updated customer first name.

lastName

No

Updated customer last name.

address1

Yes

Updated address (line 1).

address2

No

Updated address (line 2).

city

Yes

Updated city.

county

No

Updated county.

province

No

Updated state or province.

countryCode

Yes

Updated country code.

postalCode

No

Updated postal code or Zip code.

 
Required Keys and Roles
ClickBank API Key

API Order Write Role

Return Type
No content

 

POST /1.3/orders2/{receipt}/changeDate
This method lets you change the date of the next rebill payment for a recurring product. The payment amount is not altered.

 

You and the customer are sent a notification of the date change, including the new payment date and the payment amount (not including tax).

 

Request Parameters
Name

Required

Description

changeDate

Yes

The date on which the next payment will be made. This date must be in the future. The date format is yyyy-mm-dd.

sku

Required for orders with multiple items

The SKU of the line item. Used to identify individual purchases in multi-item cart purchases.

NOTE – If you have changed the product associated with a subscription using the changeProduct endpoint, you must use the SKU of the original product, instead of the current SKU.

 
Required Keys and Roles
ClickBank API Key
​

API Subscription Modification Role

Return Type
No content

POST /1.3/orders2/{receipt}/extend
This method lets you extend a subscription by a specified number of rebill periods.

 

Request Parameters
Name

Required

Description

numPeriods

Yes

The number of periods by which to extend the subscription.

sku

Required for orders with multiple items

The SKU of the line item. Used to identify individual purchases in multi-item cart purchases.

 
Required Keys and Roles
ClickBank API Key

API Subscription Modification Role

Return Type
No content

 

POST /1.3/orders2/{receipt}/pause
This method lets you pause a subscription, postponing payments until a specified date. An email confirmation is sent to the customer and to you.

 

The date on which payments are restarted must be later than the next scheduled payment. For example, if a monthly subscription was last billed on January 1, the restart date must be February 1 or later. The restart date must also be within the next 60 days.

 

Request Parameters
Name

Required

Description

restartDate

Yes

The date on which the subscription will be resumed. This date cannot be earlier than the next scheduled payment date, and must be within the next 60 days.

The date format is yyyy-mm-dd.

sku

Required for orders with multiple items

The SKU of the line item. Used to identify individual purchases in multi-item cart purchases.

 
Required Keys and Roles
ClickBank API Key

API Subscription Modification Role

Return Type
No content

 

POST /1.3/orders2/{receipt}/reinstate
This method lets you restart a cancelled subscription.

You can only reinstate cancellations within 60 days of the cancellation.

 

Request Parameters
Name

Required

Description

sku

Required for orders with multiple items

The SKU of the line item. Used to identify individual purchases in multi-item cart purchases.

NOTE – If you have changed the product associated with a subscription using the changeProduct endpoint, you must use the SKU of the original product, instead of the current SKU.

 
Required Keys and Roles
ClickBank API Key

API Subscription Modification Role

Return Type
No content

 

HEAD /1.3/orders2/{receipt}
This method tells you whether a particular recurring product subscription is active - that is, it has not been refunded, charged back, or canceled.

 

If the subscription is active, it returns a status code of 204. If the subscription is not active, the subscription cannot be found, or if you do not have permission to access the subscription, it returns a status code of 403.

 

NOTE – You should use the receipt number of the initial transaction for a rebill product, rather than the receipt number for one of the rebill transactions. Using a rebill transaction receipt number only provides information on that transaction, rather than for the subscription as a whole.

 

Request Parameters
Name

Required

Description

sku

Required for orders with multiple items

The SKU of the line item. Used to identify individual purchases in multi-item cart purchases.

 
Required Keys and Roles
ClickBank API Key

API Order Read Role

Return Type
None

 

Supported Output Types
application/xml

application/json

Return Types
This section details the return types used by the Orders API.

The following return types are covered in this section:

List of Order Data

List of Order Data
List of Order Data returns use the following format:

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:cb="http://www.clickbank.com/api" version="1.0">
<xs:element name="orderData" type="orderData"/>
<xs:complexType name="orderData">
<xs:sequence>
<xs:element name="transactionTime" type="xs:dateTime" nillable="true" minOccurs="0"/>
<xs:element name="receipt" type="xs:string" nillable="true" minOccurs="0"/>
<xs:element name="trackingId" type="xs:string" nillable="true" minOccurs="0"/>
<xs:element name="paytmentMethod" type="xs:string" nillable="true" minOccurs="0"/>
<xs:element name="transactionType" type="xs:string" nillable="true" minOccurs="0"/>
<xs:element name="totalOrderAmount" type="xs:decimal" nillable="true" minOccurs="0"/>
<xs:element name="totalShippingAmount" type="xs:decimal" nillable="true" minOccurs="0"/>
<xs:element name="totalTaxAmount" type="xs:decimal" nillable="true" minOccurs="0"/>
<xs:element name="vendor" type="xs:string" nillable="true" minOccurs="0"/>
<xs:element name="affiliate" type="xs:string" nillable="true" minOccurs="0"/>
<xs:element name="country" type="xs:string" nillable="true" minOccurs="0"/>
<xs:element name="state" type="xs:string" nillable="true" minOccurs="0"/>
<xs:element name="lastName" type="xs:string" nillable="true" minOccurs="0"/>
<xs:element name="firstName" type="xs:string" nillable="true" minOccurs="0"/>
<xs:element name="currency" type="xs:string" nillable="true" minOccurs="0"/>
<xs:element name="declinedConsent" type="xs:string" nillable="true" minOccurs="0"/>
<xs:element name="email" type="xs:string" nillable="true" minOccurs="0"/>
<xs:element name="postalCode" type="xs:string" nillable="true" minOccurs="0"/>
<xs:element name="customerContactInfo" type="contactField" nillable="true" minOccurs="0" maxOccurs="unbounded"/>
<xs:element name="role" type="xs:string" nillable="true" minOccurs="0"/>
<xs:element name="fullName" type="xs:string" nillable="true" minOccurs="0"/>
<xs:element name="customerRefundableState" type="refundableState" nillable="true" minOccurs="0"/>
<xs:element name="vendorVariables" type="vendorVariableElementArray" nillable="true" minOccurs="0"/>
<xs:element name="lineItemData" type="lineItemData" minOccurs="0" maxOccurs="unbounded"/>
</xs:sequence>
</xs:complexType>
<xs:complexType name="contactField">
<xs:sequence>
<xs:element name="field" type="xs:string" nillable="true" minOccurs="0"/>
<xs:element name="value" type="xs:string" nillable="true" minOccurs="0"/>
</xs:sequence>
</xs:complexType>
<xs:complexType name="vendorVariableElement">
<xs:sequence>
<xs:element name="name" type="xs:string" minOccurs="0"/>
<xs:element name="value" type="xs:string" minOccurs="0"/>
</xs:sequence>
</xs:complexType>
<xs:complexType name="lineItemData">
<xs:sequence>
<xs:element name="itemNo" type="xs:string" minOccurs="0"/>
<xs:element name="productTitle" type="xs:string" nillable="true" minOccurs="0"/>
<xs:element name="recurring" type="xs:boolean" minOccurs="0"/>
<xs:element name="shippable" type="xs:boolean" minOccurs="0"/>
<xs:element name="customerAmount" type="xs:decimal" nillable="true" minOccurs="0"/>
<xs:element name="accountAmount" type="xs:decimal" nillable="true" minOccurs="0"/>
<xs:element name="quantity" type="xs:int" nillable="true" minOccurs="0"/>
<xs:element name="lineItemType" type="xs:string" nillable="true" minOccurs="0"/>
<xs:element name="refundsBlocked" type="xs:boolean" minOccurs="0"/>
<xs:element name="rebillAmount" type="xs:decimal" nillable="true" minOccurs="0"/>
<xs:element name="processedPayments" type="xs:int" nillable="true" minOccurs="0"/>
<xs:element name="futurePayments" type="xs:int" nillable="true" minOccurs="0"/>
<xs:element name="nextPaymentDate" type="xs:dateTime" nillable="true" minOccurs="0"/>
<xs:element name="status" type="xs:string" nillable="true" minOccurs="0"/>
</xs:sequence>
</xs:complexType>
<xs:simpleType name="refundableState">
<xs:restriction base="xs:string">
<xs:enumeration value="REFUNDABLE"/>
<xs:enumeration value="SUGGESTED_REFUND_BLOCK"/>
<xs:enumeration value="UNREFUNDABLE"/>
<xs:enumeration value="ALREADY_REFUNDED"/>
<xs:enumeration value="TO_OLD"/>
<xs:enumeration value="REFUND_BLOCKED"/>
<xs:enumeration value="HAS_OPEN_REFUND"/>
<xs:enumeration value="OVER_ELV_LIMIT"/>
<xs:enumeration value="PROVIDER_DISCONNECTED"/>
</xs:restriction>
</xs:simpleType>
<xs:complexType name="vendorVariableElementArray" final="#all">
<xs:sequence>
<xs:element name="item" type="vendorVariableElement" minOccurs="0" maxOccurs="unbounded" nillable="true"/>
</xs:sequence>
</xs:complexType>
</xs:schema>
Usage Information
For additional information about using the Orders API, see the ClickBank APIs article.

 

Related Articles
Transactions Reporting – This article explains how to view order information in the UI.

