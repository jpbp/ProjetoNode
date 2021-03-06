//criptografar senha do usuer 
const bcrypt = require('bcrypt-nodejs')

module.exports= app =>{
    const { existOrError,notExistOrError,equalsOrError} = app.api.validator
    const encryptPassword = password=>{
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password,salt)
    }
    const save = async(req,res)=>{
        const user = {...req.body}
        if(req.params.id) user.id = req.params.id

        try{
            existOrError(user.name,'Nome não encontrado')
            existOrError(user.email,'email não encontrado')
            existOrError(user.password,'senha não informada')
            existOrError(user.confirmPassword,'confirmação de senha invalada')
            equalsOrError(user.password,user.confirmPassword,'senhas invalidas')

            const userFromdb = await app.db('users').where({email:user.email}).first()

            if(user.id){
                notExistOrError(userFromdb,'usuario já existe')
            }

        }catch(msg){
            return res.status(400).send(msg)
        }

        user.password= encryptPassword(user.password)
        delete user.confirmPassword

        if(user.id){
            app.db('users')
            .update(user)
            .where({id: user.id})
            .then(_ => res.status(204).send())
            .catch(err=> res.status(500).send(err))
        }else{
            app.db('users')
            .insert(user)
            .then(_=>res.status(204).send())
            .catch(err => res.status(500).send(err))
        }
    }
    const get = (req,res)=>{
        app.db('users')
        .select('id','name','email','admin')
        .then(users=>res.json(users))
        .catch(err=>res.status(500).send(err))
        
    }
    const getbyId = (req,res)=>{
       
        
        app.db('users')
        .select('id','name','email','admin').where({id:req.params.id})
        .then(user=>res.json(user))
        .catch(err=>res.status(500).send(err))
        
    }
  


    return { save ,get , getbyId }
}