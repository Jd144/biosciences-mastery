const razorpay = new Razorpay({
  key_id: "rzp_test_Sah8TPEtNXOLVj",
  key_secret: "2fn31sstHk31wFj8IACqLNoq",
})

await razorpay.orders.create({
  amount: 100,
  currency: "INR",
})
