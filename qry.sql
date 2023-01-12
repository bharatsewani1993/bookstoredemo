select orders.id,orders.customerId,orderitems.bookId from orders 
INNER JOIN orderitems
on orders.id = orderitems.orderId
INNER JOIN books
on books.id = orderitems.bookId
inner join users
on users.id = orders.customerId