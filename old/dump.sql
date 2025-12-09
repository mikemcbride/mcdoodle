PRAGMA foreign_keys=OFF;
CREATE TABLE IF NOT EXISTS `polls` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL
);
CREATE TABLE IF NOT EXISTS `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`order` integer NOT NULL,
	`poll_id` text NOT NULL,
	FOREIGN KEY (`poll_id`) REFERENCES `polls`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE IF NOT EXISTS `responses` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`question_id` text NOT NULL,
	`submission_id` text NOT NULL,
	`poll_id` text NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`poll_id`) REFERENCES `polls`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE IF NOT EXISTS `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`person` text NOT NULL,
	`poll_id` text NOT NULL,
	FOREIGN KEY (`poll_id`) REFERENCES `polls`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE IF NOT EXISTS `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL
, `created_at` text NOT NULL);
CREATE TABLE IF NOT EXISTS `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`password` text NOT NULL,
	`is_admin` integer DEFAULT 0 NOT NULL,
	`is_verified` integer DEFAULT 0
);

INSERT INTO polls VALUES('zu9vn58js1yka01pzk7n2jfd','TOOL Team 14 Summer Availability','','open');

INSERT INTO questions VALUES('ym2122qgvq1agt3hv4ym1vmz','2025-06-06',0,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('yffqbn8hqg28txfzo11ypt99','2025-06-07',1,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('yr8irslf4uyt1zwhyj0owj0o','2025-06-14',2,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('ejr130ikzr0xmumcvhlooidy','2025-06-13',3,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('hohrc9crgefjv1c4fv67damk','2025-06-20',4,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('vcua5j5fbhhu0rg81r04oncy','2025-06-21',5,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('dzp0kmy8ywqa1au86f6tfp74','2025-06-27',6,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('t3a5p92qkq2otml0g9h6bpuv','2025-06-28',7,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('evqvwzcltlxyikn9183twai0','2025-07-04',8,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('vjaut8tfhiqi9lv5kxh1fhlb','2025-07-05',9,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('osbo08jey94j7111lg25dqq0','2025-07-11',10,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('mzqnsv6srhff9wpfiieltc3r','2025-07-12',11,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('dsuaxtnjv8mpw5yts22llkub','2025-07-18',12,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('s2xy5tsnkpsiqvgo1gsrqyz1','2025-07-19',13,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('kavj1fxfdina3dppc7xg5nng','2025-07-25',14,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('j5yfvcalrea75ipscnm7zonx','2025-07-26',15,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('uthsozpwsrpjxmpj6727wa4u','2025-08-01',16,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('peykek96osgkxtd3rse9ink3','2025-08-02',17,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('j9zu2l35dvy3eblsrgqrtptz','2025-08-09',18,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('qw0iqzq7vc4y4te2j8qxbttm','2025-08-08',19,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('nkjwcdx239cqd6ydlmfwjrp7','2025-08-15',20,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('vps4hqxjgekni7rf67ypk164','2025-08-16',21,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('d8mqaf5093pdx66poiaxqz8e','2025-08-23',22,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('vtci5513tseniqjvib47s502','2025-08-22',23,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('zfx70vzw7e27htrawoisqzci','2025-08-29',24,'zu9vn58js1yka01pzk7n2jfd');
INSERT INTO questions VALUES('gl5n1cky73vn2oadsf4e1t2a','2025-08-30',25,'zu9vn58js1yka01pzk7n2jfd');

INSERT INTO responses VALUES('s0n0icpohw2gaabyxu36wdex','yes','ym2122qgvq1agt3hv4ym1vmz','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('ntbe8bqj415abwsp1rskj85t','yes','yffqbn8hqg28txfzo11ypt99','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('uftc01x3oqoycrybdz7h3ojd','yes','ejr130ikzr0xmumcvhlooidy','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('u3zm4e67k260w9ywlfxcqeen','yes','yr8irslf4uyt1zwhyj0owj0o','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('m8l2l8e5ko6h3dg59zx3ev4m','yes','hohrc9crgefjv1c4fv67damk','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('oemlvudu47wh1o794yjo1g7p','yes','vcua5j5fbhhu0rg81r04oncy','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('de8bhuhgl8ibqx8hz8xyy843','yes','dzp0kmy8ywqa1au86f6tfp74','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('xuch6kt13crnnex83428jrkp','yes','t3a5p92qkq2otml0g9h6bpuv','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('kqgy5bsa12b0nsexbo5juoi5','no','evqvwzcltlxyikn9183twai0','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('pye3wwrno0ef4lvhig30na0e','yes','vjaut8tfhiqi9lv5kxh1fhlb','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('al54wwf3n8fjf7ny3n34qunc','yes','osbo08jey94j7111lg25dqq0','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('n16gz9br0sxyndelz8knzudx','yes','mzqnsv6srhff9wpfiieltc3r','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('xqtlek0h0opj23ex2e7ll1bx','no','dsuaxtnjv8mpw5yts22llkub','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('wgxxrzx2bcsabjm3k4s9sow4','no','s2xy5tsnkpsiqvgo1gsrqyz1','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('nhq9wu9ewayk2sqedr447k9w','yes','kavj1fxfdina3dppc7xg5nng','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('ph4pcqbge5sszhukqgmy05vb','yes','j5yfvcalrea75ipscnm7zonx','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('nemjry4ltyosga5ni8003jk9','no','uthsozpwsrpjxmpj6727wa4u','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('b4e3auz0sxkwlaukl7am0gcl','no','peykek96osgkxtd3rse9ink3','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('nf1nx7wcsrdt0c3xrflz0wiv','yes','qw0iqzq7vc4y4te2j8qxbttm','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('k6qzy6lmg6rtqquog5gj3ppn','yes','j9zu2l35dvy3eblsrgqrtptz','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('lufq6ygupjpqkqwe4c6vr0vu','yes','nkjwcdx239cqd6ydlmfwjrp7','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('e503vcoms396rhw3lzfjskph','yes','vps4hqxjgekni7rf67ypk164','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('utrf8lvstegxd9ttpwkkiv5q','yes','vtci5513tseniqjvib47s502','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('nu34j6n2n1wrof381yvt5bjr','yes','d8mqaf5093pdx66poiaxqz8e','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('qcfvgxcfiblui7ut4tgskupu','no','zfx70vzw7e27htrawoisqzci','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('s7612jqjbd5u1p5kt8nn479f','no','gl5n1cky73vn2oadsf4e1t2a','kmx44ji6g7t4ek0lw6e4bx08','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('qor0mg8iszjk34qt9uuddd9x','no','ym2122qgvq1agt3hv4ym1vmz','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('wdietylq6lqhb6ch1nd6h4se','yes','yffqbn8hqg28txfzo11ypt99','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('bzb1kbypmzo9r0tusftduxli','if_needed','ejr130ikzr0xmumcvhlooidy','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('v1nuxmijwra8eg8wz1p7a22y','yes','yr8irslf4uyt1zwhyj0owj0o','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('y0wnn03oud5lawul0hul4rkw','yes','hohrc9crgefjv1c4fv67damk','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('s4p8fc430p4hnibhpf82eg1w','yes','vcua5j5fbhhu0rg81r04oncy','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('hddcbaixtalge2vqa50y2711','no','dzp0kmy8ywqa1au86f6tfp74','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('lfgd4vt0nly68g57puzsw6id','no','t3a5p92qkq2otml0g9h6bpuv','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('ma17f7llrqcm262ht3avu4cj','no','evqvwzcltlxyikn9183twai0','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('rrrx1un76h0am6w0hnt5slcw','no','vjaut8tfhiqi9lv5kxh1fhlb','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('gr3y945i94jh5cyyp0smzdg8','no','osbo08jey94j7111lg25dqq0','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('plpkllw1y19xa5nem00kf6jd','no','mzqnsv6srhff9wpfiieltc3r','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('hlwds06qxr5c2eh4rgb9p33v','no','dsuaxtnjv8mpw5yts22llkub','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('t1t14vyenqu6m7speid1ctrx','no','s2xy5tsnkpsiqvgo1gsrqyz1','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('fh6azol84e4trq7st3ps244z','if_needed','kavj1fxfdina3dppc7xg5nng','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('k6qpznbgbg9r8cmrzrowzvgf','no','j5yfvcalrea75ipscnm7zonx','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('srl3d1kudk3ssnx31ykxvisn','no','uthsozpwsrpjxmpj6727wa4u','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('b774j4rjfqy25al8jzut93yw','no','peykek96osgkxtd3rse9ink3','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('hj537xnp3tppzooj1xvs59gf','yes','qw0iqzq7vc4y4te2j8qxbttm','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('eeof05masemceoe3bhs8071n','no','j9zu2l35dvy3eblsrgqrtptz','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('eyasfmqne2h89xlnzn4k6maa','yes','nkjwcdx239cqd6ydlmfwjrp7','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('j9yhhw92m8chqge23i70uc7y','yes','vps4hqxjgekni7rf67ypk164','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('n08bgxzv5winp4h9ywnex7y2','yes','vtci5513tseniqjvib47s502','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('q57r6qz2x38ldcv59ud2es9w','yes','d8mqaf5093pdx66poiaxqz8e','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('kes0fl85f76qar1f09v56qn9','yes','zfx70vzw7e27htrawoisqzci','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('tbgovzr4yezg5sdturt6lqy5','yes','gl5n1cky73vn2oadsf4e1t2a','fhdne1p02ngdtya3qhde2ib6','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('u7ycnj1hozrkb48xlg1bvwu2','if_needed','ym2122qgvq1agt3hv4ym1vmz','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('hihbaqgar2pqchd5nmd1irr5','yes','yffqbn8hqg28txfzo11ypt99','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('qqxsegefp3qk8rjy6w9yhod9','no','ejr130ikzr0xmumcvhlooidy','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('oybum4gx4bkza53l8aogptqk','no','yr8irslf4uyt1zwhyj0owj0o','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('n5w0upzj79pdwy4za37mtrh8','yes','hohrc9crgefjv1c4fv67damk','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('cv0y857l7t3vd11ozmlfvfx6','yes','vcua5j5fbhhu0rg81r04oncy','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('scn885fe2blrz4hz2zruh3zu','yes','dzp0kmy8ywqa1au86f6tfp74','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('bz07bvcjxji1izlj0u4j9dcz','yes','t3a5p92qkq2otml0g9h6bpuv','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('i1icy6ter1dz6ahmf5zq352y','yes','evqvwzcltlxyikn9183twai0','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('sep32v5za22tirssmm835khx','yes','vjaut8tfhiqi9lv5kxh1fhlb','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('jdql9wmq0demw6hvt77ec2l2','yes','osbo08jey94j7111lg25dqq0','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('oaviwgeuuaf1r9zt1rfb1tsf','yes','mzqnsv6srhff9wpfiieltc3r','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('qj3abryb69hjhls2hmqbkh3z','yes','dsuaxtnjv8mpw5yts22llkub','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('njq8sbo00x3halg3n7b8hsgk','yes','s2xy5tsnkpsiqvgo1gsrqyz1','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('bgufhsfajxte7tlsdv2e9ddr','no','kavj1fxfdina3dppc7xg5nng','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('p9x0ow0hgvghb1cxkrvcucj1','no','j5yfvcalrea75ipscnm7zonx','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('rc0k3hyi8yhmni6zxmpec1hn','no','uthsozpwsrpjxmpj6727wa4u','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('v081zp1akeen7qvs3qevl5ms','no','peykek96osgkxtd3rse9ink3','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('axjye3kf0q1jwkoej41n0k70','no','qw0iqzq7vc4y4te2j8qxbttm','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('r73z3u26xf8kl5k6lh0kbret','no','j9zu2l35dvy3eblsrgqrtptz','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('ah6gktlz0ngdmgpovwak154e','yes','nkjwcdx239cqd6ydlmfwjrp7','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('k23ma8shwkdkf9sjurc571ld','yes','vps4hqxjgekni7rf67ypk164','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('mkshtqbpkzk1l88opevp86wt','yes','vtci5513tseniqjvib47s502','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('omo5kfdin2x5q71dgfnwh6er','yes','d8mqaf5093pdx66poiaxqz8e','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('krieoxbpqnjsox680zkgk9pj','yes','zfx70vzw7e27htrawoisqzci','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('rc8zgrx61ys0c3x0o57jvhna','yes','gl5n1cky73vn2oadsf4e1t2a','upcm3kmx558ffu8xzvf6e79u','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('idohqvqjxg3usf0fw43g2ju0','if_needed','ym2122qgvq1agt3hv4ym1vmz','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('oq1ucxqn52wk9jfgbnpetqn4','yes','yffqbn8hqg28txfzo11ypt99','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('sefrcghpqqc2nly967llbltg','if_needed','ejr130ikzr0xmumcvhlooidy','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('diw955i8db24h5rechin14zv','if_needed','yr8irslf4uyt1zwhyj0owj0o','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('qdjq9miiu7yjew1d1qh36cu4','no','hohrc9crgefjv1c4fv67damk','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('b8n4wpqmtaawwjhbw6lbyiyf','if_needed','vcua5j5fbhhu0rg81r04oncy','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('hlccw3v5xw9dnmb3pz6jr4b6','no','dzp0kmy8ywqa1au86f6tfp74','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('g6qqvglvk2l2rn0sam4s77ep','yes','t3a5p92qkq2otml0g9h6bpuv','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('hmf7j7ubqj15n9s9nnmu9low','no','evqvwzcltlxyikn9183twai0','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('azcss4yc4n2pl40by1mw84su','no','vjaut8tfhiqi9lv5kxh1fhlb','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('xuhbemz8dom15wxjb0otp6bn','yes','osbo08jey94j7111lg25dqq0','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('ujn93ik0f7ot6mx0c3lumuxm','no','mzqnsv6srhff9wpfiieltc3r','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('xpby3gb4wbjbg9tck8xmelyy','no','dsuaxtnjv8mpw5yts22llkub','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('t5kick44nvc6mlixv8njh98c','no','s2xy5tsnkpsiqvgo1gsrqyz1','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('jgxepepew0pado56k7q4oxvj','yes','kavj1fxfdina3dppc7xg5nng','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('z9hp635kfm9115pllj5ebnm6','yes','j5yfvcalrea75ipscnm7zonx','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('nhyv3dcdckfa3lpdbl3marfc','if_needed','uthsozpwsrpjxmpj6727wa4u','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('c6bu988qq9ynxazt5e6ti765','if_needed','peykek96osgkxtd3rse9ink3','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('eght2k8kow99b5vec5xwek0i','yes','qw0iqzq7vc4y4te2j8qxbttm','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('j7d0hateaxkaxqkwu105abry','yes','j9zu2l35dvy3eblsrgqrtptz','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('nybgq3dtp58o1nv3oyq67k0j','yes','nkjwcdx239cqd6ydlmfwjrp7','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('mdn5h3yndo4du9xu3qbwjwwx','if_needed','vps4hqxjgekni7rf67ypk164','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('eoakcm4swz1mdfryux0rc2ln','if_needed','vtci5513tseniqjvib47s502','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('t2px91ijk25nwx5vtkmj6g4o','yes','d8mqaf5093pdx66poiaxqz8e','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('orpbqid302hqcpk4ojopj8ym','yes','zfx70vzw7e27htrawoisqzci','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO responses VALUES('o1km8my8askqi720q03qyzye','yes','gl5n1cky73vn2oadsf4e1t2a','iq41qs9q998snucrvbf7b4lc','zu9vn58js1yka01pzk7n2jfd');

INSERT INTO submissions VALUES('kmx44ji6g7t4ek0lw6e4bx08','Wills','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO submissions VALUES('fhdne1p02ngdtya3qhde2ib6','Zaegel','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO submissions VALUES('upcm3kmx558ffu8xzvf6e79u','Dalys','zu9vn58js1yka01pzk7n2jfd');
INSERT INTO submissions VALUES('iq41qs9q998snucrvbf7b4lc','McBrides','zu9vn58js1yka01pzk7n2jfd');

INSERT INTO verifications VALUES('c6cq875u3c9nn36ufi3jvg02','mike.mcbride@hey.com','expired','2024-04-11T20:59:57.111Z');
INSERT INTO verifications VALUES('y4g63i8i47diegl3uu2ihk6k','rmcbride0914@gmail.com','verified','2024-04-11T22:44:51.540Z');
INSERT INTO verifications VALUES('cn1nxb1n8n8dyp82d97tx6av','rmcbride0914@gmail.com','expired','2024-05-21T01:31:05.211Z');
INSERT INTO verifications VALUES('w8ufvz1hf6moj92ylckxyzud','rmcbride0914@gmail.com','expired','2024-05-21T01:33:05.354Z');
INSERT INTO verifications VALUES('wem9lmc3qifldrgfdyw1flu9','mike.mcbride@hey.com','active','2024-05-21T03:46:35.108Z');
INSERT INTO verifications VALUES('kr64ne0zaoak48j3zy6szis3','mike.mcbride@hey.com','active','2024-05-21T03:50:08.894Z');
INSERT INTO verifications VALUES('md5idgadgwojukhuger141wp','mike.mcbride@hey.com','verified','2024-05-21T04:02:56.723Z');
INSERT INTO verifications VALUES('n0craanerjfdhlu2kwezhak9','mike.mcbride@hey.com','active','2024-05-21T04:49:19.748Z');
INSERT INTO verifications VALUES('pfu2o1ox8b2o0v6osl2cjku3','mike.mcbride@hey.com','expired','2024-05-21T05:11:55.419Z');
INSERT INTO verifications VALUES('yabzglmjdvpgv6ktqv4qb67e','rmcbride0914@gmail.com','active','2024-05-21T05:18:04.283Z');
INSERT INTO verifications VALUES('izkvapdtc0vhtrf7l04ppckn','mike.mcbride@hey.com','active','2024-05-21T05:29:49.279Z');
INSERT INTO verifications VALUES('nltbt274bkblt5pait4gg5kt','mike.mcbride@hey.com','active','2024-05-21T05:33:23.149Z');
INSERT INTO verifications VALUES('c72icgp3vn4nzpb0lvko4nmo','mike.mcbride@hey.com','active','2024-05-21T05:40:41.564Z');
INSERT INTO verifications VALUES('r1ric3se7s0wkye200bn0im5','rmcbride0914@gmail.com','expired','2024-06-06T02:09:50.356Z');

INSERT INTO users VALUES('y6k3udina3mvtwrdd1zhg4l4','mike.mcbride@hey.com','Mike','McBride','8b1f1615030b7d504ea9d65415529f9282966cb1889688c846b2b0c8224e6f9511ec985d0cdc8f84489517d2e0252aec8367c71369bc36bee8395dbf5ed9caa4',1,1);
INSERT INTO users VALUES('vxo7txh8mm5ec2vkiqlz6oux','rmcbride0914@gmail.com','Becky','McBride','ee49a705afb60afdb3dcdf043c658fcc2787d819a3ef197e25ac80f714e4505507562b9f287d164680686945e0f88dc117dc758f61f7c14bf44cdf75ca67b3dc',1,1);

CREATE INDEX `question_poll_idx` ON `questions` (`poll_id`);
CREATE INDEX `response_poll_idx` ON `responses` (`poll_id`);
CREATE INDEX `submission_poll_idx` ON `submissions` (`poll_id`);
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);

