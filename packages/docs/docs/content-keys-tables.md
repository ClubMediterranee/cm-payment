## Payment Providers

<div class="content-keys-table">

| Clé                                        | Valeur par défaut                                      | Variables  |
| ------------------------------------------ | ------------------------------------------------------ | ---------- |
| `paymentProviders.validation.required`     | You must choose a payment method                       | -          |
| `paymentProviders.creditCard.label`        | I pay by credit card the amount of \{amount\}          | `{amount}` |
| `paymentProviders.paypal.label`            | I pay by PayPal the amount of \{amount\}               | `{amount}` |
| `paymentProviders.bankTransfer.label`      | I pay by bank transfer the amount of \{amount\}        | `{amount}` |
| `paymentProviders.bankTransfer.security`   | Secure 100% payment (direct connection with your bank) | -          |
| `paymentProviders.bankTransfer.paymentCap` | No payment limit for standard bank transfers           | -          |

</div>

## Payment Schedule

<div class="content-keys-table">

| Clé                                          | Valeur par défaut                                                                                               | Variables                             |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `paymentSchedule.payFullAmount`              | I pay today the full amount of \{amount\}                                                                       | `{amount}`                            |
| `paymentSchedule.payDeposit`                 | I pay today, at no charge, a deposit of \{amount\} and at the latest on \{deadline\} the balance of \{balance\} | `{amount}`, `{deadline}`, `{balance}` |
| `paymentSchedule.buyNowPayLater.iconLabel`   | I pay in \{icon\} by credit card                                                                                | `{icon}`                              |
| `paymentSchedule.buyNowPayLater.priceLabel`  | Pay monthly from \{price\}                                                                                      | `{price}`                             |
| `paymentSchedule.buyNowPayLater.unavailable` | Pay Monthly is currently unavailable                                                                            | -                                     |

</div>

## Cgv

<div class="content-keys-table">

| Clé                         | Valeur par défaut                                                                                                                                                                                                                                                                                                                                                        | Variables |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| `cgv.title`                 | Terms and Conditions                                                                                                                                                                                                                                                                                                                                                     | -         |
| `cgv.content`               | Validating my reservation implies a payment obligation. [FBL] I am informed of the obligation to present a negative test result or proof of complete vaccination for Covid-19 to access the Resort between May 21 and September 30, 2021 (details on the Resort page). I accept the General Conditions of Sale and declare that I have also read the Information Form.\* | -         |
| `cgv.validation.required`   | You must accept the terms and conditions                                                                                                                                                                                                                                                                                                                                 | -         |
| `cgv.validation.mustAccept` | You must accept the T&C                                                                                                                                                                                                                                                                                                                                                  | -         |

</div>

## Contact Choice

<div class="content-keys-table">

| Clé                                   | Valeur par défaut                                                                                                                                                         | Variables |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `contactChoice.title`                 | What type of channel?                                                                                                                                                     | -         |
| `contactChoice.choiceLabel`           | By \{label\}                                                                                                                                                              | `{label}` |
| `contactChoice.validation.required`   | Contact choice information is required                                                                                                                                    | -         |
| `contactChoice.choices.email`         | Email                                                                                                                                                                     | -         |
| `contactChoice.choices.call`          | Phone                                                                                                                                                                     | -         |
| `contactChoice.choices.mobile_phone`  | SMS                                                                                                                                                                       | -         |
| `contactChoice.call.sendLink`         | To complete the payment, you will be prompted to request the client’s various payment information. You will be able to track your client’s payment progress in real time. | -         |
| `contactChoice.email.invalid`         | Invalid email                                                                                                                                                             | -         |
| `contactChoice.email.sendLink`        | To complete the payment, we will immediately send your client an email with a payment link. You will need to track your client’s payment progress in real time.           | -         |
| `contactChoice.mobile_phone.invalid`  | Invalid phone number                                                                                                                                                      | -         |
| `contactChoice.mobile_phone.sendLink` | To complete the payment, we will immediately send a payment link to your client’s phone number. You will need to track your client’s payment progress in real time.       | -         |

</div>

## Credit Card Form

<div class="content-keys-table">

| Clé                                            | Valeur par défaut         | Variables |
| ---------------------------------------------- | ------------------------- | --------- |
| `creditCardForm.title`                         | Card details              | -         |
| `creditCardForm.fullName`                      | Cardholder name           | -         |
| `creditCardForm.cardNumber`                    | Card number               | -         |
| `creditCardForm.expiryDate`                    | Expiry date               | -         |
| `creditCardForm.cvc`                           | Security code             | -         |
| `creditCardForm.validation.expiryDate`         | Expiry date is required   | -         |
| `creditCardForm.validation.expired`            | Card is expired           | -         |
| `creditCardForm.validation.cardNumber`         | Invalid card number       | -         |
| `creditCardForm.validation.cardNumberRequired` | Card number is required   | -         |
| `creditCardForm.validation.cvc`                | Invalid security code     | -         |
| `creditCardForm.validation.cvcRequired`        | Security code is required | -         |

</div>

## Free Deposit

<div class="content-keys-table">

| Clé                                  | Valeur par défaut                            | Variables |
| ------------------------------------ | -------------------------------------------- | --------- |
| `freeDeposit.title`                  | Pay the amount of your choice without fees   | -         |
| `freeDeposit.totalRemaining`         | Total remaining to pay                       | -         |
| `freeDeposit.before`                 | before                                       | -         |
| `freeDeposit.payNowLabel`            | I pay now                                    | -         |
| `freeDeposit.placeholder`            | Please enter an amount                       | -         |
| `freeDeposit.validation.required`    | Please enter an amount                       | -         |
| `freeDeposit.validation.positive`    | The amount must be greater than 0            | -         |
| `freeDeposit.validation.maxExceeded` | The amount cannot exceed the remaining total | -         |

</div>

## Card Installments

<div class="content-keys-table">

| Clé                                             | Valeur par défaut                        | Variables             |
| ----------------------------------------------- | ---------------------------------------- | --------------------- |
| `cardInstallments.title`                        | Payment method                           | -                     |
| `cardInstallments.selectCardType`               | Select your card type                    | -                     |
| `cardInstallments.selectInstallments`           | Select the number of installments        | -                     |
| `cardInstallments.installmentLabel`             | \{count\} X of \{amount\}                | `{count}`, `{amount}` |
| `cardInstallments.validation.methodRequired`    | Please select a payment method           | -                     |
| `cardInstallments.validation.conditionRequired` | Please select the number of installments | -                     |

</div>

## Billing Address

<div class="content-keys-table">

| Clé                                              | Valeur par défaut                                                 | Variables |
| ------------------------------------------------ | ----------------------------------------------------------------- | --------- |
| `billingAddress.title`                           | Billing Address                                                   | -         |
| `billingAddress.fields.first_name`               | First Name                                                        | -         |
| `billingAddress.fields.last_name`                | Last Name                                                         | -         |
| `billingAddress.fields.number`                   | Street Number                                                     | -         |
| `billingAddress.fields.street`                   | Street                                                            | -         |
| `billingAddress.fields.add_on`                   | Additional Information                                            | -         |
| `billingAddress.fields.city`                     | City                                                              | -         |
| `billingAddress.fields.state_or_district`        | State / Province                                                  | -         |
| `billingAddress.fields.zip_code`                 | Postal Code                                                       | -         |
| `billingAddress.fields.country`                  | Country                                                           | -         |
| `billingAddress.fields.country_code`             | Country                                                           | -         |
| `billingAddress.fields.additional_information_1` | Additional Information 1                                          | -         |
| `billingAddress.fields.additional_information_2` | Additional Information 2                                          | -         |
| `billingAddress.fields.town`                     | Town                                                              | -         |
| `billingAddress.placeholders.select`             | Select an option                                                  | -         |
| `billingAddress.validation.required`             | This field is required                                            | -         |
| `billingAddress.validation.maxLength`            | Maximum length exceeded                                           | -         |
| `billingAddress.validation.pattern`              | Invalid format                                                    | -         |
| `billingAddress.validation.invalidValue`         | Invalid value                                                     | -         |
| `billingAddress.errors.schemaFetchFailed`        | Failed to load billing address form. Please try again.            | -         |
| `billingAddress.errors.schemaInvalid`            | Billing address form configuration error. Please contact support. | -         |

</div>
