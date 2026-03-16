import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const prisma = getPrisma();
  try {
    const { telefone, nome, sobrenome, cpf } = await request.json();

    if (!cpf || typeof cpf !== "string") {
      return NextResponse.json(
        { message: "CPF é obrigatório." },
        { status: 400 },
      );
    }

    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      return NextResponse.json({ message: "CPF inválido." }, { status: 400 });
    }

    if (!telefone || typeof telefone !== "string") {
      return NextResponse.json(
        { message: "Telefone é obrigatório." },
        { status: 400 },
      );
    }

    const telefoneLimpo = telefone.replace(/\D/g, "");
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      return NextResponse.json(
        { message: "Telefone inválido." },
        { status: 400 },
      );
    }

    const nomeTrim = typeof nome === "string" ? nome.trim() : "";
    const sobrenomeTrim = typeof sobrenome === "string" ? sobrenome.trim() : "";
    const isCadastro = Boolean(nomeTrim && sobrenomeTrim);

    if (!isCadastro) {
      // Login simplificado: CPF + telefone
      const usuario = await prisma.usuario.findFirst({
        where: { cpf: cpfLimpo, telefone: telefoneLimpo },
      });

      if (!usuario) {
        return NextResponse.json(
          { message: "Usuário não encontrado. Faça cadastro primeiro." },
          { status: 404 },
        );
      }

      return NextResponse.json({
        id: usuario.id,
        nome: `${usuario.nome} ${usuario.sobrenome ?? ""}`.trim(),
        sobrenome: usuario.sobrenome,
        cpf: usuario.cpf,
        telefone: usuario.telefone,
      });
    }

    let usuario = await prisma.usuario.findUnique({
      where: { telefone: telefoneLimpo },
    });

    if (usuario) {
      if (usuario.cpf !== cpfLimpo) {
        const cpfDuplicado = await prisma.usuario.findFirst({
          where: { cpf: cpfLimpo },
        });

        if (cpfDuplicado && cpfDuplicado.id !== usuario.id) {
          return NextResponse.json(
            { message: "CPF já cadastrado com outro telefone." },
            { status: 400 },
          );
        }
      }

      usuario = await prisma.usuario.update({
        where: { telefone: telefoneLimpo },
        data: {
          nome: nomeTrim,
          sobrenome: sobrenomeTrim,
          cpf: cpfLimpo,
        },
      });
    } else {
      const cpfExistente = await prisma.usuario.findFirst({
        where: { cpf: cpfLimpo },
      });

      if (cpfExistente) {
        return NextResponse.json(
          { message: "CPF já cadastrado com outro telefone." },
          { status: 400 },
        );
      }

      usuario = await prisma.usuario.create({
        data: {
          nome: nomeTrim,
          sobrenome: sobrenomeTrim,
          cpf: cpfLimpo,
          telefone: telefoneLimpo,
        },
      });
    }

    return NextResponse.json({
      id: usuario.id,
      nome: `${usuario.nome} ${usuario.sobrenome}`,
      sobrenome: usuario.sobrenome,
      cpf: usuario.cpf,
      telefone: usuario.telefone,
    });
  } catch (error) {
    console.error("/api/auth/phone error", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Erro interno no servidor ao processar login.",
      },
      { status: 500 },
    );
  }
}
