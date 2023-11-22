import nodemailer from 'nodemailer';

export class NodeMailer {
    async sendEmail(Useremail: string, titulo: string, text: string) {
        let transport = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'comandaferrero@gmail.com',
                pass: 'lqplikfqqedvuvis'
            }
        });

        let email = await transport.sendMail({
            from: 'Sistema VTV <comandaferrero@gmail.com>',
            to: Useremail,
            subject: titulo,
            text: text
        });
    }
}
