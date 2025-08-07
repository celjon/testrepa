import { Locale, Translation } from './translation'

export const translations: Record<Locale, Translation> = {
  en: {
    indexLayout: {
      header: {
        title: 'Neural Network Aggregator',
      },

      midjourney: {
        title: 'Midjourney is already available on the website!',
        subtitle: 'Try the new interface, together with Midjourney!',
        tryMidjourney: 'Try Midjourney',
      },

      footer: {
        companyName: 'Limited Liability Partnership «BotHub»',
        pricing: 'Pricing',
        forInvestors: 'For investors',
        forBusiness: 'For business',
        contacts: 'Contacts',
      },
    },

    welcomeMailSubject: 'Welcome to Bothub.chat',
    welcomeMail: {
      title: 'Welcome to Bothub.chat',
      subtitle: 'You have successfully registered, use the data to access the personal dashboard.',
      profile: 'Profile',
    },

    verificationMailSubject: 'Your verification code',
    verificationMail: {
      title: 'Your verification code',
      subtitle: 'You have successfully registered, use code to verify your email.',
      yourCode: 'Your code',
    },
    generatedArticlesLinksMailSubject: 'Generated articles links',
    generatedArticlesLinksMail: { title: 'Generated articles links' },

    giftTokenMailSubject: 'You have received gift tokens',
    giftTokenMail: {
      title: 'You have received gift tokens',
      body1: 'You have received',
      body2: 'tokens on the neural network aggregator',
      body3: 'from another user on our platform.',
      codeText: 'Activation code:',
      promptText: 'Enter it on the website in settings',
      forWhoText: 'Sent for:',
      messageText: 'With message:',
      bottomText1: 'How to get gift?',
      bottomText2: 'You need to authenticate using this email address',
      auth: 'Authorization',
    },

    passwordRecoveryMailSubject: 'Bothub password reset',
    passwordRecoveryMail: {
      title: 'Bothub password reset',
      subtitle: 'To reset your password, click the button below',
      resetPassword: 'Reset password',
      bottomText:
        'You have received this message because your email address was registered on our site. Please ignore this email if you did not request a password reset.',
    },

    softLimitMailSubject: 'Soft limit notification',
    softLimitMail: {
      title: 'Hello, everything is fine?',
      subtitle:
        'We are notifying you that your organization is approaching the soft limit of resources in your account.',
      body1:
        'According to the data, the current usage of resources is greater than the specified value.',
      body2:
        'We want to verify if this soft limit is not affecting the availability of the service. Therefore, we recommend that you review the resource usage policy and change the limit if necessary.',
      body3:
        'If you have any questions, send an email to contact@bothub.chat, we are here to help!',
      body4: 'Best regards, the BotHub team!',
    },

    updateVerificationMailSubject: 'Your verification code',
    updateVerificationMail: {
      title: 'Your verification code',
      subtitle: 'Use this code to confirm your email change.',
      yourCode: 'Your code',
    },
  },

  es: {
    indexLayout: {
      header: {
        title: 'Agregador de redes neuronales',
      },

      midjourney: {
        title: 'Midjourney ya está disponible en el sitio web!',
        subtitle: '¡Prueba la nueva interfaz, junto con Midjourney!',
        tryMidjourney: 'Prueba Midjourney',
      },

      footer: {
        companyName: 'Limited Liability Partnership «BotHub»',
        pricing: 'Precios',
        forInvestors: 'Para inversores',
        forBusiness: 'Para negocios',
        contacts: 'Contactos',
      },
    },

    welcomeMailSubject: 'Bienvenido a Bothub.chat',
    welcomeMail: {
      title: 'Bienvenido a Bothub.chat',
      subtitle: 'Ha registrado correctamente, utilice los datos para acceder al tablero personal.',
      profile: 'Perfil',
    },

    verificationMailSubject: 'Tu código de verificación',
    verificationMail: {
      title: 'Tu código de verificación',
      subtitle: 'Te has registrado exitosamente, usa el código para verificar tu email.',
      yourCode: 'Tu código',
    },

    giftTokenMailSubject: 'Has recibido un regalo en forma de fichas!',
    giftTokenMail: {
      title: 'Has recibido un regalo en forma de fichas!',
      body1: 'Has recibido',
      body2: 'fichas en tu tablero neuronal',
      body3: 'de otro usuario en nuestro sitio.',
      codeText: 'Código de activación:',
      promptText: 'Introdúzcalo en el sitio web en la configuración',
      forWhoText: 'Enviado para:',
      messageText: 'Con mensaje:',
      bottomText1: '¿Cómo obtener un regalo?',
      bottomText2: 'Necesitas autenticarte usando este correo electrónico',
      auth: 'Autenticación',
    },

    passwordRecoveryMailSubject: 'Bothub password reset',
    passwordRecoveryMail: {
      title: 'Bothub password reset',
      subtitle: 'Para restablecer su contraseña, haga clic en el botón de abajo',
      resetPassword: 'Restablecer contraseña',
      bottomText:
        'Ha recibido este mensaje porque su dirección de correo electrónico se registró en nuestro sitio. Por favor, ignore este correo electrónico si no solicitó una restablecimiento de contraseña.',
    },

    softLimitMailSubject: 'Aviso sobre límite suave',
    softLimitMail: {
      title: '¡Hola, todo bien?',
      subtitle:
        'Le informamos que su organización está acercando al límite suave de recursos en su cuenta.',
      body1: 'Según los datos, el uso actual de recursos es mayor que el valor especificado.',
      body2:
        'Queremos verificar si este límite suave no está afectando la disponibilidad del servicio. Por lo tanto, recomendamos que revise la política de uso de recursos y cambie el límite si es necesario.',
      body3:
        'Si tiene alguna pregunta, envíe un correo electrónico a contact@bothub.chat, estamos aquí para ayudarlo!',
      body4: 'Saludos cordiales, el equipo BotHub!',
    },

    updateVerificationMailSubject: 'Tu código de verificación',
    updateVerificationMail: {
      title: 'Tu código de verificación',
      subtitle: 'Usa este código para confirmar el cambio de tu correo electrónico.',
      yourCode: 'Tu código',
    },
    generatedArticlesLinksMailSubject: '',
    generatedArticlesLinksMail: {
      title: '',
    },
  },

  fr: {
    indexLayout: {
      header: {
        title: 'Agrégateur de réseaux neuronaux',
      },

      midjourney: {
        title: 'Midjourney est déjà disponible sur le site !',
        subtitle: 'Essayez l’interface mise à jour, en collaboration avec Midjourney !',
        tryMidjourney: 'Essayez Midjourney',
      },

      footer: {
        companyName: 'Limited Liability Partnership «BotHub»',
        pricing: 'Tarifs',
        forInvestors: 'Pour les investisseurs',
        forBusiness: 'Pour les entreprises',
        contacts: 'Contacts',
      },
    },

    welcomeMailSubject: 'Bienvenue à Bothub.chat',
    welcomeMail: {
      title: 'Bienvenue à Bothub.chat',
      subtitle:
        'Vous avez enregistré avec succès, utilisez les données pour accéder au tableau de bord personnel.',
      profile: 'Profil',
    },

    verificationMailSubject: 'Votre code de vérification',
    verificationMail: {
      title: 'Votre code de vérification',
      subtitle: 'Vous avez enregistré avec succès, utilisez le code pour vérifier votre email.',
      yourCode: 'Votre code',
    },

    giftTokenMailSubject: 'Vous avez reçu des jetons de cadeau!',
    giftTokenMail: {
      title: 'Vous avez reçu des jetons de cadeau!',
      body1: 'Vous avez reçu',
      body2: 'jetons sur votre tableau de bord de réseaux neuronaux',
      body3: "d'un autre utilisateur sur notre site.",
      codeText: "Code d'activation :",
      promptText: 'Entrez-le sur le site dans les paramètres',
      forWhoText: 'Envoyé pour :',
      messageText: 'Avec message :',
      bottomText1: 'Comment obtenir un cadeau?',
      bottomText2: 'Vous devez vous authentifier en utilisant cette adresse e-mail',
      auth: 'Authentification',
    },

    passwordRecoveryMailSubject: 'Bothub password reset',
    passwordRecoveryMail: {
      title: 'Bothub password reset',
      subtitle: 'Pour réinitialiser votre mot de passe, cliquez sur le bouton ci-dessous',
      resetPassword: 'Réinitialiser le mot de passe',
      bottomText:
        "Vous avez reçu ce message car votre adresse e-mail a été enregistrée sur notre site. Veuillez ignorer ce courriel si vous n'avez pas demandé un réinitialisation de mot de passe.",
    },

    softLimitMailSubject: "Notification de limite de l'utilisation",
    softLimitMail: {
      title: 'Bonjour, tout va bien?',
      subtitle:
        'Nous vous informons que votre organisation est proche de la limite de ressources de votre compte.',
      body1:
        "Selon les données, l'utilisation actuelle des ressources est supérieure au montant spécifié.",
      body2:
        "Nous souhaitons vérifier si cette limite de l'utilisation n'affecte pas la disponibilité du service. Par conséquent, nous vous recommandons de revoir la politique de l'utilisation des ressources et de modifier la limite si nécessaire.",
      body3:
        'Si vous avez des questions, envoyez un e-mail à contact@bothub.chat, nous sommes là pour vous aider!',
      body4: "Cordialement, l'équipe BotHub!",
    },

    updateVerificationMailSubject: 'Votre code de vérification',
    updateVerificationMail: {
      title: 'Votre code de vérification',
      subtitle: 'Utilisez ce code pour confirmer le changement de votre adresse e-mail.',
      yourCode: 'Votre code',
    },
    generatedArticlesLinksMailSubject: '',
    generatedArticlesLinksMail: {
      title: '',
    },
  },

  pt: {
    indexLayout: {
      header: {
        title: 'Agregador de redes neurais',
      },

      midjourney: {
        title: 'Midjourney já está disponível no site!',
        subtitle: 'Experimente o novo interface, junto com o Midjourney!',
        tryMidjourney: 'Experimente Midjourney',
      },

      footer: {
        companyName: 'Limited Liability Partnership «BotHub»',
        pricing: 'Preços',
        forInvestors: 'Para investidores',
        forBusiness: 'Para empresas',
        contacts: 'Contatos',
      },
    },

    verificationMailSubject: 'Seu código de verificação',
    verificationMail: {
      title: 'Seu código de verificação',
      subtitle: 'Você registrou-se com sucesso, use o código para verificar seu email.',
      yourCode: 'Seu código',
    },

    passwordRecoveryMailSubject: 'Bothub password reset',
    passwordRecoveryMail: {
      title: 'Bothub password reset',
      subtitle: 'Para redefinir sua senha, clique no botão abaixo',
      resetPassword: 'Redefinir senha',
      bottomText:
        'Você recebeu este e-mail porque seu endereço de e-mail foi registrado em nosso site. Por favor, ignore este e-mail se você não solicitou uma redefinição de senha.',
    },

    giftTokenMailSubject: 'Você recebeu um token de presente!',
    giftTokenMail: {
      title: 'Você recebeu um token de presente!',
      body1: 'Você recebeu',
      body2: 'tokens no seu dashboard de rede neural',
      body3: 'de outro usuário no nosso site.',
      codeText: 'Código de ativação:',
      promptText: 'Insira-o no site nas configurações',
      forWhoText: 'Enviado para:',
      messageText: 'Com mensagem:',
      bottomText1: 'Como obter um presente?',
      bottomText2: 'Você precisa autenticar usando este e-mail',
      auth: 'Autenticação',
    },

    softLimitMailSubject: 'Alerta de limite de uso',
    softLimitMail: {
      title: 'Olá, tudo bem?',
      subtitle:
        'Estamos avisando que sua organização está atingindo o limite de uso de recursos em sua conta.',
      body1: 'De acordo com os dados, o uso atual dos recursos é maior que o valor especificado.',
      body2:
        'Queremos verificar se este limite de uso não está afetando a disponibilidade do serviço. Por isso, recomendamos que você revise a política de uso de recursos e altere o limite caso necessário.',
      body3:
        'Caso tenha alguma dúvida, envie um e-mail para contato@bothub.chat, estamos à disposição para ajudar!',
      body4: 'Atenciosamente,',
    },

    welcomeMailSubject: 'Bem-vindo ao Bothub.chat',
    welcomeMail: {
      title: 'Bem-vindo ao Bothub.chat',
      subtitle: 'Você registrou-se com sucesso, use os dados para acessar o painel pessoal.',
      profile: 'Perfil',
    },

    updateVerificationMailSubject: 'Seu código de verificação',
    updateVerificationMail: {
      title: 'Seu código de verificação',
      subtitle: 'Use este código para confirmar a alteração do seu e-mail.',
      yourCode: 'Seu código',
    },
    generatedArticlesLinksMailSubject: '',
    generatedArticlesLinksMail: {
      title: '',
    },
  },

  ru: {
    indexLayout: {
      header: {
        title: 'Агрегатор нейросетей',
      },

      midjourney: {
        title: 'Midjourney уже доступен на сайте!',
        subtitle: 'Попробуйте обновленный интерфейс, вместе с Midjourney!',
        tryMidjourney: 'Попробовать Midjourney',
      },

      footer: {
        companyName: 'ООО «Ботхаб» ОГРН 1236300016259',
        pricing: 'Пакеты',
        forInvestors: 'Для инверсторов',
        forBusiness: 'Для бизнеса',
        contacts: 'Контакты',
      },
    },

    welcomeMailSubject: 'Добро пожаловать на Bothub.chat',
    welcomeMail: {
      title: 'Добро пожаловать на Bothub.chat',
      subtitle: 'Вы успешно зарегистрировались, используйте данные для доступа в личный кабинет.',
      profile: 'Личный кабинет',
    },

    verificationMailSubject: 'Ваш код подтверждения',
    verificationMail: {
      title: 'Ваш код подтверждения',
      subtitle:
        'Вы успешно зарегистрировались, используйте данный код для подтверждения вашей почты.',
      yourCode: 'Ваш код',
    },

    updateVerificationMailSubject: 'Ваш код подтверждения',
    updateVerificationMail: {
      title: 'Ваш код подтверждения',
      subtitle: 'Используйте данный код для подтверждения смены вашей почты.',
      yourCode: 'Ваш код',
    },

    giftTokenMailSubject: 'Вы получили подарок в виде токенов!',
    giftTokenMail: {
      title: 'Вы получили подарок в виде токенов!',
      body1: 'Вы получили',
      body2: 'токенов на агрегаторе нейросетей',
      body3: 'от другого пользователя нашей платформы.',
      codeText: 'Код активации:',
      promptText: 'Введите его на сайте в настройках',
      forWhoText: 'Отправлено для:',
      messageText: 'С сообщением:',
      bottomText1: 'Как получить подарок?',
      bottomText2: 'Вам необходимо авторизоваться используя данный e-mail адрес',
      auth: 'Авторизация',
    },

    passwordRecoveryMailSubject: 'Восстановление пароля',
    passwordRecoveryMail: {
      title: 'Восстановление пароля',
      subtitle: 'Чтобы сбросить пароль, нажмите на кнопку ниже',
      resetPassword: 'Сбросить пароль',
      bottomText:
        'Вы получили это письмо, потому что ваш адрес был указан на нашем сайте при регистрации. Проигнорируйте это письмо, если это были не вы.',
    },

    softLimitMailSubject: 'Уведомление о soft limit',
    softLimitMail: {
      title: 'Добрый день!',
      subtitle:
        'Уведомляем Вас о том, что Ваша организация приближается к установленному soft лимиту использования caps.',
      body1:
        'Согласно статистике, текущий объем использования ресурсов близок к заданному Вами пороговому значению.',
      body2:
        'Хотим заверить, что достижение soft limit не повлияет на доступность сервиса. При этом рекомендуем рассмотреть возможность корректировки данного порога в личном кабинете, если такого количества caps не хватает для комфортного использования',
      body3:
        'В случае возникновения вопросов - пишите в чат в телеграмме, мы с радостью поможем разобраться!',
      body4: 'С уважением, команда BotHub!',
    },
    generatedArticlesLinksMailSubject: 'Ссылки на сгенерированные статьи',
    generatedArticlesLinksMail: {
      title: 'Ссылки на сгенерированные статьи',
    },
  },
}
