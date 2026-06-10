import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { PageHead } from '../../components/PageHead';
import { SectionHead } from '../../components/SectionHead';
import { Button } from '../../components/Button';
import { colors, fonts } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STEPS = [
  { n: '01', t: 'Escolha os alambiques', p: 'Navegue pelo guia e marque os engenhos que você quer conhecer — por região, estilo de cachaça ou nota da comunidade.' },
  { n: '02', t: 'A gente traça a rota', p: 'Diga de onde você parte e o Cachaceiro monta a ordem mais esperta de visitar todos, rodando o mínimo de estrada.' },
  { n: '03', t: 'Pegue a estrada', p: 'Receba o roteiro pronto, parada por parada, com distância e tempo de cada trecho. É só seguir e provar.' },
];

const NUMBERS = [
  { n: '147', p: 'Alambiques no guia' },
  { n: '23 cidades', p: 'De Salinas ao Sul de Minas' },
  { n: '5 regiões', p: 'Das Vertentes à Canastra' },
  { n: '9.842', p: 'Avaliações da comunidade' },
  { n: '412', p: 'Trechos de estrada mapeados' },
  { n: 'segundos', p: 'Pra montar o roteiro' },
  { n: '4.81 ★', p: 'Nota média dos engenhos' },
  { n: '0 voltas', p: 'A rota nunca se cruza' },
];

export default function SobreScreen() {
  const { width } = useWindowDimensions();
  const narrow = width <= 1080;
  const phone = width <= 640;
  const numCols = phone ? 1 : narrow ? 2 : 4;
  const numBasis = `${100 / numCols}%` as const;

  const nav = useNavigation<Nav>();

  return (
    <Screen active="Sobre">
      <PageHead
        crumbs={[{ label: 'Mapa' }, { label: 'Sobre', current: true }]}
        title={['Sobre o\n', { em: 'Cachaceiro.' }]}
        lede="Cachaceiro Viajante é um guia de viagem para os apaixonados por boa cachaça. Você escolhe os alambiques; a gente cuida do caminho — pra você gastar menos estrada e mais tempo onde importa: na varanda, com o copo na mão."
      />

      {/* THE PUN */}
      <View style={[styles.leadGrid, narrow && styles.col]}>
        <View style={{ flex: 1.1 }}>
          <Text style={styles.punH}>
            Do <Text style={styles.strike}>caixeiro</Text> <Text style={styles.red}>cachaceiro</Text> viajante.
          </Text>
          <Text style={styles.p}>
            Todo mundo conhece o velho caixeiro viajante, aquele vendedor que cruzava o interior de mala na mão atrás do melhor caminho entre uma cidade e outra.
          </Text>
          <Text style={styles.p}>
            Aqui a gente trocou a mala de amostras por um copo de boa cachaça. As cidades viraram alambiques; as distâncias, as estradas de terra de Minas. A pergunta continua a mesma — <Text style={styles.em}>qual a melhor ordem de visitar todos?</Text> — e a resposta ainda economiza estrada, tempo e gasolina.
          </Text>
          <Text style={styles.p}>
            Você diz aonde quer ir. O Cachaceiro acha o caminho mais curto que passa por tudo, sem voltar na mesma estrada. Simples assim.
          </Text>
        </View>
        <View style={styles.swapcard}>
          <View style={styles.seal}><Text style={styles.sealText}>O TROCADILHO</Text></View>
          <View style={styles.swapRow}>
            <Text style={[styles.term, { color: colors.inkSoft }]}>Caixeiro</Text>
            <Text style={styles.gloss}>VENDEDOR DE PORTA EM PORTA</Text>
          </View>
          <Text style={styles.swapArrow}>↓</Text>
          <View style={styles.swapRow}>
            <Text style={[styles.term, { color: colors.red }]}>Cachaceiro</Text>
            <Text style={styles.gloss}>APRECIADOR DE CACHAÇA BOA</Text>
          </View>
          <View style={styles.hr} />
          <View style={styles.swapRow}>
            <Text style={[styles.term, { fontSize: 22 }]}>Viajante</Text>
            <Text style={styles.gloss}>QUEM PEGA A MELHOR ROTA</Text>
          </View>
        </View>
      </View>

      {/* HOW IT WORKS */}
      <View style={styles.section}>
        <SectionHead title={'Como\nfunciona.'} sub="Em três passos você sai do sofá direto pra estrada, com o roteiro inteiro na mão." />
        <View style={[styles.stepGrid, narrow && styles.col]}>
          {STEPS.map((s) => (
            <View key={s.n} style={styles.step}>
              <Text style={styles.stepN}>{s.n}</Text>
              <Text style={styles.stepT}>{s.t}</Text>
              <Text style={styles.stepP}>{s.p}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* WHY TRUST THE ROUTE */}
      <View style={styles.section}>
        <SectionHead title={'Por que a\nrota é boa.'} sub="Não é só juntar pontos no mapa. A ordem importa — e a ordem certa muda sua viagem." />
        <View style={[styles.benefitGrid, narrow && styles.col]}>
          <View style={styles.benefit}>
            <Text style={styles.badge}>● MENOS VOLANTE</Text>
            <Text style={styles.benefitH}>A ordem mais curta</Text>
            <Text style={styles.benefitWhen}>SEM VOLTAR NA MESMA ESTRADA</Text>
            <Text style={styles.benefitP}>O Cachaceiro testa as combinações e escolhe a sequência que cobre todas as suas paradas com o menor número de quilômetros. Você chega em cada alambique na melhor hora — e ainda sobra dia.</Text>
            <View style={styles.statRow}>
              <View><Text style={styles.statV}>até −30%</Text><Text style={styles.statK}>DE ESTRADA</Text></View>
              <View><Text style={styles.statV}>0 voltas</Text><Text style={styles.statK}>NO CAMINHO</Text></View>
            </View>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.badge}>● DO SEU JEITO</Text>
            <Text style={styles.benefitH}>Você no comando</Text>
            <Text style={styles.benefitWhen}>QUANTAS PARADAS QUISER</Text>
            <Text style={styles.benefitP}>Escolha de onde parte, quantos alambiques entram e refaça quando quiser. De um bate-volta de fim de semana a uma viagem de uma semana inteira, o roteiro se ajusta a você.</Text>
            <View style={styles.statRow}>
              <View><Text style={styles.statV}>segundos</Text><Text style={styles.statK}>PRA REFAZER</Text></View>
              <View><Text style={styles.statV}>147</Text><Text style={styles.statK}>ENGENHOS</Text></View>
            </View>
          </View>
        </View>
      </View>

      {/* NUMBERS */}
      <View style={styles.section}>
        <SectionHead title={'Minas em\nnúmeros.'} sub="O que cabe neste guia — terra de cachaça boa não é pouca coisa." />
        <View style={styles.numGrid}>
          {NUMBERS.map((s) => (
            <View key={s.p} style={[styles.num, { width: numBasis }]}>
              <Text style={styles.numN}>{s.n}</Text>
              <Text style={styles.numP}>{s.p.toUpperCase()}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA */}
      <View style={styles.cta}>
        <Text style={styles.ctaH}>Agora é com você{'\n'}e a estrada.</Text>
        <Text style={styles.ctaP}>
          Escolha os alambiques, deixe a gente achar a ordem, e vá. A cachaça mais redonda de Minas está sempre a uma estrada de distância.
        </Text>
        <View style={styles.ctaBtns}>
          <Button label="Montar minha rota" onPress={() => nav.navigate('Rotas')} />
          <Button label="Explorar os alambiques" ghost onPress={() => nav.navigate('Alambiques')} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  col: { flexDirection: 'column' },
  section: { paddingVertical: 56, borderBottomWidth: 1, borderBottomColor: colors.rule },

  leadGrid: { flexDirection: 'row', columnGap: 56, rowGap: 30, paddingVertical: 56, borderBottomWidth: 1, borderBottomColor: colors.rule, alignItems: 'center' },
  punH: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 40, lineHeight: 44, color: colors.ink, marginBottom: 22 },
  strike: { color: colors.inkSoft, textDecorationLine: 'line-through', textDecorationColor: colors.red },
  red: { color: colors.red },
  p: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 29, color: colors.inkSoft, marginBottom: 16 },
  em: { fontStyle: 'italic', color: colors.ink },

  swapcard: { flex: 0.9, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.rule, borderRadius: 8, padding: 30 },
  seal: { position: 'absolute', top: -14, right: 24, backgroundColor: colors.red, borderRadius: 4, paddingVertical: 7, paddingHorizontal: 12 },
  sealText: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1.8, color: colors.cream },
  swapRow: { flexDirection: 'row', alignItems: 'center', columnGap: 16, paddingVertical: 14 },
  term: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 30, color: colors.ink },
  gloss: { flex: 1, textAlign: 'right', fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.4, color: colors.inkSoft },
  swapArrow: { textAlign: 'center', fontSize: 20, color: colors.copper, paddingVertical: 4 },
  hr: { height: 1, backgroundColor: colors.rule, marginVertical: 18 },

  stepGrid: { flexDirection: 'row', columnGap: 24, rowGap: 24 },
  step: { flex: 1, borderTopWidth: 2, borderTopColor: colors.ink, paddingTop: 20 },
  stepN: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 40, color: colors.red, marginBottom: 10 },
  stepT: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 24, color: colors.ink, marginBottom: 10 },
  stepP: { fontFamily: fonts.serif, fontSize: 16, lineHeight: 25, color: colors.inkSoft },

  benefitGrid: { flexDirection: 'row', columnGap: 24, rowGap: 24 },
  benefit: { flex: 1, borderWidth: 1, borderColor: colors.rule, borderRadius: 8, paddingVertical: 28, paddingHorizontal: 30, backgroundColor: colors.paper },
  badge: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 1.6, color: colors.moss, marginBottom: 16 },
  benefitH: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 30, color: colors.ink, marginBottom: 6 },
  benefitWhen: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.2, color: colors.inkSoft, marginBottom: 14 },
  benefitP: { fontFamily: fonts.serif, fontSize: 15.5, lineHeight: 24, color: colors.inkSoft, marginBottom: 18 },
  statRow: { flexDirection: 'row', columnGap: 22, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.rule },
  statV: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 22, color: colors.ink },
  statK: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1.4, color: colors.inkSoft },

  numGrid: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderLeftWidth: 1, borderColor: colors.rule },
  num: { paddingVertical: 26, paddingHorizontal: 24, borderRightWidth: 1, borderBottomWidth: 1, borderColor: colors.rule, backgroundColor: colors.paper },
  numN: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 24, color: colors.ink, marginBottom: 6 },
  numP: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.2, color: colors.inkSoft },

  cta: { paddingVertical: 56, alignItems: 'center' },
  ctaH: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 52, lineHeight: 54, color: colors.ink, textAlign: 'center', marginBottom: 20 },
  ctaP: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 27, color: colors.inkSoft, textAlign: 'center', maxWidth: 520, marginBottom: 30 },
  ctaBtns: { flexDirection: 'row', columnGap: 14, rowGap: 14, flexWrap: 'wrap', justifyContent: 'center' },
});
