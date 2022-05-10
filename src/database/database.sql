create database unisetka;

create table phoneNumbers (
   num_id bigserial not null primary key,
   num_self bigint not null
);

create table users (
   user_id serial not null primary key,
   user_name VARCHAR(50),
   user_telegram_id bigint not null,
   user_phone_number bigint not null,
   user_access boolean default true,
   user_ref_id integer,
      foreign key (user_ref_id)
         references phoneNumbers(num_id)
            on delete cascade
);

create table values (
   value_id integer not null primary key,
   aksessuar real not null,
   nak real not null,
   nak2 real not null,
   setka real not null,
   razina real not null,
   oq_profil real not null,
   dekor_profil real not null,
   kurs real not null,
   muddat real not null
);

   create table characters (
      character_id serial not null primary key,
      telegram_id bigint not null,
      color varchar(100),
      seriya varchar(100),
      dimensions text [],
      character_ref_id integer,
         foreign key (character_ref_id)
            references users(user_id)
               on delete set null
   );
         

--           insert
insert into phoneNumbers (
   num_self
) VALUES (
   +998977450026
);
insert into phoneNumbers (
   num_self
) VALUES (
   +998946228820
);

insert into users(   
   user_name,
   user_telegram_id,
   user_phone_number,
   user_access,
   user_ref_id
) 
VALUES(
   'Shuhrat',
   '104739587',
   '+998977450026',
   true,
   7
);

insert into values (
   value_id,
   aksessuar,
   nak,
   nak2,
   setka,
   razina,
   oq_profil,
   dekor_profil,
   kurs,
   muddat
)
VALUES (
   1,
   1.33,
   4.1,
   2.8,
   35,
   6.2,
   6.46,
   7.07,
   11500,
   15
);

--        update

UPDATE users SET user_access = true WHERE user_telegram_id = '863091102';

UPDATE users
SET user_access = false
WHERE user_telegram_id = '104739587';

946678440
94